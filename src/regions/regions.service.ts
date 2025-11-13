import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateRegionDto } from './dto/create-region.dto';

@Injectable()
export class RegionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRegionDto) {
    // Empêcher les doublons de nom
    const existing = await this.prisma.region.findUnique({ where: { name: dto.name } });
    if (existing) throw new BadRequestException('Cette région existe déjà');

    return this.prisma.region.create({ data: { name: dto.name } });
  }

  findAll() {
    return this.prisma.region.findMany({ orderBy: { name: 'asc' } });
  }
}

