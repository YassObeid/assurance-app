import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateManagerDto } from './dto/create-manager.dto';
import { UpdateManagerDto } from './dto/update-manager.dto';

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
      throw new BadRequestException('userId inconnu');
    }
    if (!region) {
      throw new BadRequestException('regionId inconnu');
    }

    // (Option) Vérifier que le user a bien le rôle REGION_MANAGER
    if (user.role !== 'REGION_MANAGER') {
      throw new BadRequestException(
        'Le user doit avoir le rôle REGION_MANAGER',
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
      },
    });
  }

  findAll() {
    return this.prisma.regionManager.findMany({
      include: {
        user: true,
        region: true,
      },
      orderBy: [{ regionId: 'asc' }, { startAt: 'desc' }],
    });
  }

  async findOne(id: string) {
    const row = await this.prisma.regionManager.findUnique({
      where: { id },
      include: {
        user: true,
        region: true,
        delegates: true, // pratique : voir aussi les délégués de ce manager
      },
    });

    if (!row) {
      throw new NotFoundException('Manager introuvable');
    }

    return row;
  }

  async update(id: string, dto: UpdateManagerDto) {
    const data: any = { ...dto };

    if (dto.startAt) data.startAt = new Date(dto.startAt);
    if (dto.endAt) data.endAt = new Date(dto.endAt);

    try {
      return await this.prisma.regionManager.update({
        where: { id },
        data,
        include: {
          user: true,
          region: true,
          delegates: true,
        },
      });
    } catch {
      throw new NotFoundException('Manager introuvable');
    }
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
