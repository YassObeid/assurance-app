import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { QueryMemberDto } from './dto/query-member.dto';
import { currentRegionIdsForManager } from '../common/region-access.helper';

@Injectable()
export class MembersService {
  constructor(private prisma: PrismaService) {}

  // Création d'un membre pour le délégué connecté
  async create(dto: CreateMemberDto, user: any) {
    // On récupère le délégué lié à l'utilisateur connecté
    const delegate = await this.prisma.delegate.findUnique({
      where: { userId: user.userId },
    });

    if (!delegate) {
      throw new Error('Aucun délégué associé à cet utilisateur');
    }

    return this.prisma.member.create({
      data: {
        cin: dto.cin,
        fullName: dto.fullName,
        status: dto.status ?? 'ACTIVE',
        // On relie au délégué courant via la relation Prisma
        delegate: { connect: { id: delegate.id } },
      },
    });
  }

  // Liste des membres avec filtrage simple + restrictions par rôle
  async findAll(q: QueryMemberDto, user: any) {
    const where: any = {};

    if (q.status) where.status = q.status;
    if (q.q) where.fullName = { contains: q.q, mode: 'insensitive' };

    // Si c'est un délégué, il ne voit que ses membres
    if (user.role === 'DELEGATE') {
      const delegate = await this.prisma.delegate.findUnique({
        where: { userId: user.userId },
      });
      if (delegate) {
        where.delegateId = delegate.id;
      }
    }

    // Si c'est un region manager, on restreint aux régions gérées
    if (user.role === 'REGION_MANAGER') {
      const regionIds = await currentRegionIdsForManager(
        this.prisma,
        user.userId,
      );
      where.delegate = { regionId: { in: regionIds } };
    }

    const rows = await this.prisma.member.findMany({
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
      },
    });

    // flatten + alignement avec le style Delegates
    return rows.map(m => ({
      id: m.id,
      cin: m.cin,
      fullName: m.fullName,
      status: m.status,
      city: m.delegate?.region?.name ?? null, // alias "city"
      delegate: m.delegate
        ? {
            id: m.delegate.id,
            name: m.delegate.name,
            phone: m.delegate.phone ?? null,
            regionId: m.delegate.regionId,
            regionName: m.delegate.region?.name ?? null,
            managerId: m.delegate.managerId,
            managerUserName: m.delegate.manager?.user?.name ?? null,
          }
        : null,
      createdAt: m.createdAt,
    }));
  }

  // Détail d'un membre
  async findOne(id: string, _user: any) {
    // TODO : tu peux ajouter ici des vérifications d'accès (délégué / manager / GM)
    return this.prisma.member.findUnique({
      where: { id },
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
  }

  // Mise à jour d'un membre
  async update(id: string, dto: CreateMemberDto, _user: any) {
    // TODO : vérifier que le user a le droit de modifier ce membre
    return this.prisma.member.update({
      where: { id },
      data: {
        cin: dto.cin,
        fullName: dto.fullName,
        status: dto.status ?? 'ACTIVE',
      },
    });
  }

  // Suppression d'un membre
  async remove(id: string, _user: any) {
    // TODO : vérifier que le user a le droit de supprimer ce membre
    return this.prisma.member.delete({ where: { id } });
  }
}
