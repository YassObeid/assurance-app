import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateDelegateDto } from './dto/create-delegate.dto';
import { UpdateDelegateDto } from './dto/update-delegate.dto';
import { currentRegionIdsForManager } from '../common/region-access.helper';

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
        phone: dto.phone ??  null,
        regionId: dto.regionId,
        managerId: dto.managerId,
        userId: dto.userId ??  null,
      },
      include: {
        region: true,
        manager: { include: { user: true, region: true } },
        user:  true,
      },
    });
  }

  async findAllForUser(user: { userId: string; role: string }) {
    if (user.role === 'GM') {
      return this.prisma.delegate.findMany({
        include: {
          region: true,
          manager: { include: { user: true, region: true } },
          user: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (user.role === 'REGION_MANAGER') {
      const regionIds = await currentRegionIdsForManager(this.prisma, user.userId);
      if (regionIds.length === 0) return [];
      return this.prisma.delegate.findMany({
        where: { regionId: { in:  regionIds } },
        include:  {
          region: true,
          manager: { include: { user: true, region: true } },
          user: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (user.role === 'DELEGATE') {
      const delegate = await this.prisma.delegate.findFirst({
        where: { userId: user.userId },
        include: {
          region:  true,
          manager: { include: { user: true, region:  true } },
          user: true,
        },
      });
      return delegate ? [delegate] : [];
    }

    throw new ForbiddenException('Rôle non autorisé à voir les délégués');
  }

  async findOneForUser(id: string, user: { userId:  string; role: string }) {
    const where:  any = { id };

    if (user.role === 'REGION_MANAGER') {
      const regionIds = await currentRegionIdsForManager(this.prisma, user.userId);
      where.regionId = { in: regionIds };
    } else if (user. role === 'DELEGATE') {
      where.userId = user. userId;
    }

    const delegate = await this.prisma. delegate.findFirst({
      where,
      include: {
        region: true,
        manager:  { include: { user: true, region: true } },
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
    if (dto. phone !== undefined) data.phone = dto.phone;
    if (dto.regionId !== undefined) data.regionId = dto.regionId;
    if (dto.managerId !== undefined) data.managerId = dto.managerId;
    if (dto.userId !== undefined) data.userId = dto.userId;

    return this. prisma.delegate.update({
      where: { id },
      data,
      include: {
        region: true,
        manager: { include:  { user: true, region: true } },
        user: true,
      },
    });
  }

  async remove(id:  string) {
    try {
      return await this.prisma.delegate. delete({
        where: { id },
      });
    } catch {
      throw new NotFoundException('Délégué introuvable');
    }
  }
}