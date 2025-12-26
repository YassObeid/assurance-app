// src/payments/payments.service.ts
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { QueryPaymentDto } from './dto/query-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { getActiveManagerIdsForUser, ensureDelegateOwnsMember } from '../common/auth.helpers';
import { RequestUser } from '../common/types/request-user.type';
import { createPaginatedResponse, PaginatedResponse } from '../common/dto/pagination.dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePaymentDto, user: RequestUser) {
    // Only DELEGATE or GM can create payments
    if (user.role !== 'DELEGATE' && user.role !== 'GM') {
      throw new ForbiddenException(
        'Seul un délégué ou le GM peut enregistrer un paiement',
      );
    }

    let delegateId: string | null = null;

    if (user.role === 'DELEGATE') {
      if (!user.delegateId) {
        throw new ForbiddenException('Aucun délégué associé à cet utilisateur');
      }

      // Verify the member belongs to this delegate
      await ensureDelegateOwnsMember(this.prisma, user.delegateId, dto.memberId);
      delegateId = user.delegateId;
    } else {
      // GM can create for any member
      const member = await this.prisma.member.findUnique({
        where: { id: dto.memberId },
        select: { delegateId: true },
      });

      if (!member) {
        throw new BadRequestException('Membre introuvable');
      }

      delegateId = member.delegateId; // Audit: keep track of delegate
    }

    const paidAt = dto.paidAt ? new Date(dto.paidAt) : new Date();

    return this.prisma.payment.create({
      data: {
        memberId: dto.memberId,
        delegateId,
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

  async findAll(q: QueryPaymentDto, user: RequestUser): Promise<PaginatedResponse<any>> {
    const where: any = {};

    if (q.memberId) where.memberId = q.memberId;
    if (q.delegateId) where.delegateId = q.delegateId;

    if (q.fromDate || q.toDate) {
      where.paidAt = {};
      if (q.fromDate) where.paidAt.gte = new Date(q.fromDate);
      if (q.toDate) where.paidAt.lte = new Date(q.toDate);
    }

    if (user.role === 'DELEGATE') {
      if (!user.delegateId) {
        return createPaginatedResponse([], 0, q.page, q.limit);
      }
      where.delegateId = user.delegateId;
    } else if (user.role === 'REGION_MANAGER') {
      const activeManagerIds = await getActiveManagerIdsForUser(
        this.prisma,
        user.userId,
      );
      if (!activeManagerIds.length) {
        return createPaginatedResponse([], 0, q.page, q.limit);
      }
      where.member = {
        delegate: {
          deletedAt: null,
          managerId: { in: activeManagerIds },
        },
      };
    } else if (user.role !== 'GM') {
      throw new ForbiddenException('Rôle non autorisé à voir les paiements');
    }

    // Calculate pagination
    const skip = (q.page - 1) * q.limit;

    // Get total count
    const total = await this.prisma.payment.count({ where });

    // Get paginated data
    const payments = await this.prisma.payment.findMany({
      where,
      skip,
      take: q.limit,
      orderBy: { paidAt: 'desc' },
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

    return createPaginatedResponse(payments, total, q.page, q.limit);
  }

  async findOne(id: string, user: RequestUser) {
    const where: any = { id };

    if (user.role === 'DELEGATE') {
      if (!user.delegateId) {
        throw new ForbiddenException('Accès refusé');
      }
      where.delegateId = user.delegateId;
    } else if (user.role === 'REGION_MANAGER') {
      const activeManagerIds = await getActiveManagerIdsForUser(
        this.prisma,
        user.userId,
      );
      where.member = {
        delegate: {
          deletedAt: null,
          managerId: { in: activeManagerIds },
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

  async update(id: string, dto: UpdatePaymentDto, user: RequestUser) {
    const payment = await this.findOne(id, user);

    if (user.role === 'DELEGATE') {
      if (!user.delegateId || payment.delegateId !== user.delegateId) {
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

  // ❌ DELETE method removed for audit trail protection
  // Payments must never be deleted to maintain complete financial audit history
  // If a payment needs to be reversed, create a new compensating payment instead
}