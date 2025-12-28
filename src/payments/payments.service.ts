// src/payments/payments.service.ts
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { QueryPaymentDto } from './dto/query-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { currentRegionIdsForManager } from '../common/region-access.helper';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePaymentDto, user: any) {
    if (user.role !== 'DELEGATE') {
      throw new ForbiddenException(
        'Seul un délégué peut enregistrer un paiement',
      );
    }

    const delegate = await this.prisma.delegate.findFirst({
      where: { userId: user.userId },
    });

    if (!delegate) {
      throw new ForbiddenException('Aucun délégué associé à cet utilisateur');
    }

    const member = await this.prisma.member.findFirst({
      where: {
        id: dto.memberId,
        delegateId: delegate.id,
      },
    });

    if (!member) {
      throw new ForbiddenException(
        "Ce membre n'appartient pas à ce délégué ou n'existe pas",
      );
    }

    const paidAt = dto.paidAt ? new Date(dto.paidAt) : new Date();

    return this.prisma.payment.create({
      data: {
        memberId: member.id,
        delegateId: delegate.id,
        amount: dto.amount,
        paidAt,
      },
      include: {
        member: {
          include: {
            delegate: {
              include: { region: true, manager: { include: { user: true } } },
            },
          },
        },
        delegate: {
          include: { region: true, manager: { include: { user: true } } },
        },
      },
    });
  }

  async findAll(q: QueryPaymentDto, user: any) {
    const where: any = {};

    if (q.memberId) where.memberId = q.memberId;
    if (q.delegateId) where.delegateId = q.delegateId;

    if (q.fromDate || q.toDate) {
      where.paidAt = {};
      if (q.fromDate) where.paidAt.gte = new Date(q.fromDate);
      if (q.toDate) where.paidAt.lte = new Date(q.toDate);
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
      if (!regionIds.length) return [];
      where.member = {
        delegate: {
          regionId: { in: regionIds },
        },
      };
    } else if (user.role !== 'GM') {
      throw new ForbiddenException('Rôle non autorisé à voir les paiements');
    }

    const payments = await this.prisma.payment.findMany({
      where,
      skip: q.skip || 0,
      take: q.take || 10,
      orderBy: { paidAt: 'desc' }, // ✅ CHANGÉ :  createdAt → paidAt
      include: {
        member: {
          include: {
            delegate: {
              include: { region: true, manager: { include: { user: true } } },
            },
          },
        },
        delegate: {
          include: { region: true, manager: { include: { user: true } } },
        },
      },
    });

    return payments;
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
      where.member = {
        delegate: {
          regionId: { in: regionIds },
        },
      };
    } else if (user.role !== 'GM') {
      throw new ForbiddenException('Accès refusé');
    }

    const payment = await this.prisma.payment.findFirst({
      where,
      include: {
        member: {
          include: {
            delegate: {
              include: { region: true, manager: { include: { user: true } } },
            },
          },
        },
        delegate: {
          include: { region: true, manager: { include: { user: true } } },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Paiement introuvable');
    }

    return payment;
  }

  async update(id: string, dto: UpdatePaymentDto, user: any) {
    const payment = await this.findOne(id, user);

    if (user.role === 'DELEGATE') {
      const delegate = await this.prisma.delegate.findFirst({
        where: { userId: user.userId },
      });
      if (!delegate || payment.delegateId !== delegate.id) {
        throw new ForbiddenException(
          'Vous ne pouvez modifier que vos propres paiements',
        );
      }
    } else if (user.role !== 'GM') {
      throw new ForbiddenException('Seul le GM ou le délégué peuvent modifier');
    }

    const data: any = {};
    if (dto.amount !== undefined) data.amount = dto.amount;
    if (dto.paidAt !== undefined) data.paidAt = new Date(dto.paidAt);

    return this.prisma.payment.update({
      where: { id },
      data,
      include: {
        member: {
          include: {
            delegate: {
              include: { region: true, manager: { include: { user: true } } },
            },
          },
        },
        delegate: {
          include: { region: true, manager: { include: { user: true } } },
        },
      },
    });
  }

  async remove(id: string, user: any) {
    const payment = await this.findOne(id, user);

    if (user.role === 'DELEGATE') {
      const delegate = await this.prisma.delegate.findFirst({
        where: { userId: user.userId },
      });
      if (!delegate || payment.delegateId !== delegate.id) {
        throw new ForbiddenException(
          'Vous ne pouvez supprimer que vos propres paiements',
        );
      }
    } else if (user.role !== 'GM') {
      throw new ForbiddenException(
        'Seul le GM ou le délégué peuvent supprimer',
      );
    }

    return this.prisma.payment.delete({
      where: { id },
    });
  }
}
