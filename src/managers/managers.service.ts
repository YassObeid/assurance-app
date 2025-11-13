import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateManagerDto } from './dto/create-manager.dto';

@Injectable()
export class ManagersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateManagerDto) {
    // Vérifs d'existence
    const [user, region] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: dto.userId } }),
      this.prisma.region.findUnique({ where: { id: dto.regionId } }),
    ]);
    if (!user) throw new BadRequestException('userId inconnu');
    if (!region) throw new BadRequestException('regionId inconnu');

    // (Option) Vérifier que le user a bien le rôle REGION_MANAGER
    if (user.role !== 'REGION_MANAGER') {
      throw new BadRequestException('Le user doit avoir le rôle REGION_MANAGER');
    }

    return this.prisma.regionManager.create({
      data: {
        userId: dto.userId,
        regionId: dto.regionId,
        startAt: dto.startAt ? new Date(dto.startAt) : new Date(),
      },
      include: { user: true, region: true },
    });
  }

  findAll() {
    return this.prisma.regionManager.findMany({
      include: { user: true, region: true },
      orderBy: [{ regionId: 'asc' }, { startAt: 'desc' }],
    });
  }
}
