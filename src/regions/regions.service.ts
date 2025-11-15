import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';


@Injectable()
export class RegionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRegionDto) {
    // Empêcher les doublons de nom
    const existing = await this.prisma.region.findUnique({
      where: { name: dto.name },
    });
    if (existing) {
      throw new BadRequestException('Cette région existe déjà');
    }

    return this.prisma.region.create({
      data: { name: dto.name },
    });
  }

  findAll() {
    return this.prisma.region.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const region = await this.prisma.region.findUnique({
      where: { id },
    });

    if (!region) {
      throw new NotFoundException('Région introuvable');
    }

    return region;
  }

  async update(id: string, dto: UpdateRegionDto) {
    // Si on change le nom, vérifier les doublons
    if (dto.name) {
      const existing = await this.prisma.region.findUnique({
        where: { name: dto.name },
      });
      if (existing && existing.id !== id) {
        throw new BadRequestException('Une autre région a déjà ce nom');
      }
    }

    try {
      return await this.prisma.region.update({
        where: { id },
        data: dto,
      });
    } catch (e) {
      throw new NotFoundException('Région introuvable');
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.region.delete({
        where: { id },
      });
    } catch (e) {
      throw new NotFoundException('Région introuvable');
    }
  }
}


