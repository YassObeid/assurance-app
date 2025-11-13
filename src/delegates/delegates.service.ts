import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateDelegateDto } from './dto/create-delegate.dto';
import { UpdateDelegateDto } from './dto/update-delegate.dto';
import { IsOptional, IsString } from 'class-validator';


@Injectable()
export class DelegatesService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateDelegateDto) {
    return this.prisma.delegate.create({
      data: {
        name: dto.name,
        phone: dto.phone ?? null,
        regionId: dto.regionId,
        managerId: dto.managerId,
        userId: dto.userId?? null,
      },
      include: {
        region: true,
        manager: { include: { user: true, region: true } },
        user: true,
      },
    });
  }

  findAll() {
    return this.prisma.delegate.findMany({
      include: {
        region: true,
        manager: { include: { user: true, region: true } },
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }


  findOne(id: string) {
    return this.prisma.delegate.findUnique({
      where: { id },
      include: {
        // région du délégué
        region: true,

        // manager du délégué (avec son user et sa région)
        manager: {
          include: {
            user: true,
            region: true,
          },
        },

        // informations sur le user lié au délégué (si connecté)
        user: true,

        // liste des membres qu’il gère
        members: {
          include: {
            payments: true, // optionnel : pour voir l’historique de paiements de chaque membre
          },
          orderBy: { createdAt: 'desc' },
        },

        // tous les paiements associés directement au délégué
        payments: true,
      },
    });
  }

 update(id: string, dto: UpdateDelegateDto) {
    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.phone !== undefined) data.phone = dto.phone; // string ou null
    if (dto.regionId !== undefined) data.regionId = dto.regionId;
    if (dto.managerId !== undefined) data.managerId = dto.managerId;
    if (dto.userId !== undefined) data.userId = dto.userId; // string ou null

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

  remove(id: string) {
    return this.prisma.delegate.delete({ where: { id } });
  }
}
