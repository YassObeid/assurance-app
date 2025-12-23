import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateDelegateDto } from './dto/create-delegate.dto';
import { UpdateDelegateDto } from './dto/update-delegate.dto';
import { getActiveManagerIdsForUser } from '../common/auth.helpers';
import { RequestUser } from '../common/types/request-user.type';

@Injectable()
export class DelegatesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDelegateDto) {
    const region = await this.prisma.region.findUnique({
      where: { id: dto.regionId },
    });
    if (!region) {
      throw new BadRequestException('Région introuvable');
    }

    const manager = await this.prisma.regionManager.findUnique({
      where: { id: dto.managerId },
    });
    if (!manager) {
      throw new BadRequestException('Manager introuvable');
    }

    // Vérifier que le manager est actif (endAt=null)
    if (manager.endAt !== null) {
      throw new BadRequestException('Ce manager n\'est plus actif');
    }

    if (manager.regionId !== dto.regionId) {
      throw new BadRequestException(
        "Ce manager n'est pas affecté à cette région",
      );
    }

    if (dto.userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: dto.userId },
      });
      if (!user) {
        throw new BadRequestException('Utilisateur introuvable');
      }
      if (user.role !== 'DELEGATE') {
        throw new BadRequestException('Le user lié doit avoir le rôle DELEGATE');
      }
    }

    return this.prisma.delegate.create({
      data: {
        name: dto.name,
        phone: dto.phone ?? null,
        regionId: dto.regionId,
        managerId: dto.managerId,
        userId: dto.userId ?? null,
      },
      include: {
        region: true,
        manager: { include: { user: true, region: true } },
        user: true,
      },
    });
  }

  async findAllForUser(user: RequestUser) {
    if (user.role === 'GM') {
      return this.prisma.delegate.findMany({
        where: { deletedAt: null },
        include: {
          region: true,
          manager: { include: { user: true, region: true } },
          user: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (user.role === 'REGION_MANAGER') {
      // Find delegates whose manager is one of this user's active assignments
      const activeManagerIds = await getActiveManagerIdsForUser(
        this.prisma,
        user.userId,
      );
      if (activeManagerIds.length === 0) return [];

      return this.prisma.delegate.findMany({
        where: {
          deletedAt: null,
          managerId: { in: activeManagerIds },
        },
        include: {
          region: true,
          manager: { include: { user: true, region: true } },
          user: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    throw new ForbiddenException('Rôle non autorisé à voir les délégués');
  }

  async findOneForUser(id: string, user: RequestUser) {
    const where: any = { id, deletedAt: null };

    if (user.role === 'REGION_MANAGER') {
      const activeManagerIds = await getActiveManagerIdsForUser(
        this.prisma,
        user.userId,
      );
      where.managerId = { in: activeManagerIds };
    } else if (user.role !== 'GM') {
      throw new ForbiddenException('Rôle non autorisé à voir ce délégué');
    }
    // GM can see all

    const delegate = await this.prisma.delegate.findFirst({
      where,
      include: {
        region: true,
        manager: { include: { user: true, region: true } },
        user: true,
      },
    });

    if (!delegate) {
      throw new NotFoundException('Délégué introuvable');
    }

    return delegate;
  }

  async update(id: string, dto: UpdateDelegateDto) {
    const existing = await this.prisma.delegate.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Délégué introuvable');
    }

    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.regionId !== undefined) data.regionId = dto.regionId;
    if (dto.managerId !== undefined) data.managerId = dto.managerId;
    if (dto.userId !== undefined) data.userId = dto.userId;

    return this.prisma.delegate.update({
      where: { id },
      data,
      include: {
        region: true,
        manager: { include: { user: true, region: true } },
        user: true,
      },
    });
  }

  async remove(id: string) {
    try {
      return await this.prisma.delegate.delete({
        where: { id },
      });
    } catch {
      throw new NotFoundException('Délégué introuvable');
    }
  }
}