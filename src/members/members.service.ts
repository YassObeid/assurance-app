import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { QueryMemberDto } from './dto/query-member.dto';
import { currentRegionIdsForManager } from '../common/region-access.helper';

@Injectable()
export class MembersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMemberDto, user: any) {
    if (user.role !== 'DELEGATE' && user.role !== 'GM') {
      throw new ForbiddenException(
        'Seul un délégué (ou le GM) peut créer un membre',
      );
    }

    if (user.role === 'GM') {
      throw new ForbiddenException(
        'Le GM ne crée pas directement des membres (utiliser le compte délégué)',
      );
    }

    const delegate = await this.prisma.delegate.findFirst({
      where: { userId: user.userId },
    });

    if (!delegate) {
      throw new BadRequestException('Aucun délégué associé à cet utilisateur');
    }

    return this.prisma.member.create({
      data: {
        cin: dto.cin,
        fullName: dto.fullName,
        status: dto.status ?? 'ACTIVE',
        delegateId: delegate.id,
      },
    });
  }

  async findAll(q: QueryMemberDto, user: any) {
    const where: any = {};

    if (q.status) {
      where.status = q.status;
    }
    if (q.q) {
      where.fullName = { contains: q.q, mode: 'insensitive' };
    }

    if (user.role === 'DELEGATE') {
      const delegate = await this.prisma.delegate.findFirst({
        where: { userId: user.userId },
      });
      if (!delegate) return [];
      where.delegateId = delegate.id;
    } else if (user.role === 'REGION_MANAGER') {
      const regionIds = await currentRegionIdsForManager(
        this.prisma,
        user.userId,
      );
      where.delegate = { regionId: { in: regionIds } };
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

  async findOne(id: string, user: any) {
    const where: any = { id };

    if (user.role === 'DELEGATE') {
      const delegate = await this.prisma.delegate.findFirst({
        where: { userId: user.userId },
      });
      if (!delegate) {
        throw new ForbiddenException('Accès refusé');
      }
      where.delegateId = delegate.id;
    } else if (user.role === 'REGION_MANAGER') {
      const regionIds = await currentRegionIdsForManager(
        this.prisma,
        user.userId,
      );
      where.delegate = { regionId: { in: regionIds } };
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

  async update(id: string, dto: CreateMemberDto, user: any) {
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

  async remove(id: string, user: any) {
    await this.findOne(id, user);
    return this.prisma.member.delete({ where: { id } });
  }
}
