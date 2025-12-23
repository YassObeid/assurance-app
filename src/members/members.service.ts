import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { QueryMemberDto } from './dto/query-member.dto';
import { getActiveManagerIdsForUser } from '../common/auth.helpers';
import { RequestUser } from '../common/types/request-user.type';

@Injectable()
export class MembersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMemberDto, user: RequestUser) {
    // Only DELEGATE or GM can create members
    if (user.role !== 'DELEGATE' && user.role !== 'GM') {
      throw new ForbiddenException(
        'Seul un délégué ou le GM peut créer un membre',
      );
    }

    let delegateId: string;

    if (user.role === 'DELEGATE') {
      // For DELEGATE, use their delegateId from token (not from body)
      if (!user.delegateId) {
        throw new BadRequestException('Aucun délégué associé à cet utilisateur');
      }
      delegateId = user.delegateId;
    } else {
      // For GM, delegateId must be provided in body
      if (!dto.delegateId) {
        throw new BadRequestException('Le delegateId est requis pour le GM');
      }
      delegateId = dto.delegateId;

      // Verify delegate exists
      const delegate = await this.prisma.delegate.findUnique({
        where: { id: delegateId },
      });
      if (!delegate) {
        throw new BadRequestException('Délégué introuvable');
      }
    }

    return this.prisma.member.create({
      data: {
        cin: dto.cin,
        fullName: dto.fullName,
        status: dto.status ?? 'ACTIVE',
        delegateId,
      },
    });
  }

  async findAll(q: QueryMemberDto, user: RequestUser) {
    const where: any = {};

    if (q.status) {
      where.status = q.status;
    }
    if (q.q) {
      where.fullName = { contains: q.q, mode: 'insensitive' };
    }

    if (user.role === 'DELEGATE') {
      if (!user.delegateId) {
        return [];
      }
      where.delegateId = user.delegateId;
    } else if (user.role === 'REGION_MANAGER') {
      // Get delegates under this manager's active assignments
      const activeManagerIds = await getActiveManagerIdsForUser(
        this.prisma,
        user.userId,
      );
      if (activeManagerIds.length === 0) {
        return [];
      }
      where.delegate = {
        deletedAt: null,
        managerId: { in: activeManagerIds },
      };
    } else if (user.role !== 'GM') {
      throw new ForbiddenException('Rôle non autorisé à voir les membres');
    }

    const members = await this.prisma.member.findMany({
      where,
      skip: q.skip,
      take: q.take,
      orderBy: { createdAt: 'desc' },
      include: {
        delegate: {
          include: {
            region: true,
            manager: { include: { user: true, region: true } },
            user: true,
          },
        },
        payments: true,
      },
    });

    return members;
  }

  async findOne(id: string, user: RequestUser) {
    const where: any = { id };

    if (user.role === 'DELEGATE') {
      if (!user.delegateId) {
        throw new ForbiddenException('Accès refusé');
      }
      where.delegateId = user.delegateId;
    } else if (user.role === 'REGION_MANAGER') {
      const activeManagerIds = await getActiveManagerIdsForUser(
        this.prisma,
        user.userId,
      );
      where.delegate = {
        deletedAt: null,
        managerId: { in: activeManagerIds },
      };
    } else if (user.role !== 'GM') {
      throw new ForbiddenException('Accès refusé');
    }

    const member = await this.prisma.member.findFirst({
      where,
      include: {
        delegate: {
          include: {
            region: true,
            manager: { include: { user: true, region: true } },
            user: true,
          },
        },
        payments: true,
      },
    });

    if (!member) {
      throw new NotFoundException('Membre introuvable');
    }

    return member;
  }

  async update(id: string, dto: CreateMemberDto, user: RequestUser) {
    // Verify ownership before update
    await this.findOne(id, user);

    const data: any = {};
    if (dto.cin !== undefined) data.cin = dto.cin;
    if (dto.fullName !== undefined) data.fullName = dto.fullName;
    if (dto.status !== undefined) data.status = dto.status;

    return this.prisma.member.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, user: RequestUser) {
    // Only GM or REGION_MANAGER can delete
    if (user.role === 'DELEGATE') {
      throw new ForbiddenException('Les délégués ne peuvent pas supprimer de membres');
    }

    // Verify ownership before delete
    await this.findOne(id, user);

    return this.prisma.member.delete({ where: { id } });
  }
}