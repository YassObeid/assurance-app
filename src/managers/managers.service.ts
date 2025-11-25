import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateManagerDto } from './dto/create-manager.dto';
import { UpdateManagerDto } from './dto/update-manager.dto';
import { UpdateManagerDto as RealUpdateManagerDto } from './dto/update-manager.dto';

@Injectable()
export class ManagersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateManagerDto) {
    // Vérifs d'existence
    const [user, region] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: dto.userId } }),
      this.prisma.region.findUnique({ where: { id: dto.regionId } }),
    ]);

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }
    if (user.role !== 'REGION_MANAGER') {
      throw new BadRequestException(
        'Le user doit avoir le rôle REGION_MANAGER',
      );
    }

    if (!region) {
      throw new NotFoundException('Région introuvable');
    }

    // Vérifier qu'il n'y a pas déjà une affectation active
    const active = await this.prisma.regionManager.findFirst({
      where: {
        userId: dto.userId,
        regionId: dto.regionId,
        endAt: null,
      },
    });

    if (active) {
      throw new BadRequestException(
        'Ce manager est déjà affecté à cette région (affectation active)',
      );
    }

    const startAt = dto.startAt ? new Date(dto.startAt) : new Date();

    return this.prisma.regionManager.create({
      data: {
        userId: dto.userId,
        regionId: dto.regionId,
        startAt,
      },
      include: {
        user: true,
        region: true,
        delegates: true,
      },
    });
  }

  async findAll() {
    return this.prisma.regionManager.findMany({
      include: {
        user: true,
        region: true,
        delegates: true,
      },
      orderBy: { startAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const manager = await this.prisma.regionManager.findUnique({
      where: { id },
      include: {
        user: true,
        region: true,
        delegates: true,
      },
    });

    if (!manager) {
      throw new NotFoundException('Manager introuvable');
    }

    return manager;
  }

  async update(id: string, dto: RealUpdateManagerDto) {
    const existing = await this.prisma.regionManager.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Manager introuvable');
    }

    const data: any = {};
    if (dto.endAt !== undefined) {
      data.endAt = dto.endAt ? new Date(dto.endAt) : null;
    }

    return this.prisma.regionManager.update({
      where: { id },
      data,
      include: {
        user: true,
        region: true,
        delegates: true,
      },
    });
  }

  async remove(id: string) {
    try {
      return await this.prisma.regionManager.delete({
        where: { id },
      });
    } catch {
      throw new NotFoundException('Manager introuvable');
    }
  }
}
