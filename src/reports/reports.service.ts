// src/reports/reports.service.ts
import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Role } from '@prisma/client';

type JwtUserPayload = {
  id: string;
  role: Role;
  delegateId?: string | null;
};

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Résumé global pour le GM
   */
  async getGlobalSummary() {
    const [
      totalMembers,
      activeMembers,
      totalDelegates,
      paymentsAgg,
    ] = await Promise.all([
      this.prisma.member.count(),
      this.prisma.member.count({ where: { status: 'ACTIVE' } }),
      this.prisma.delegate.count(),
      this.prisma.payment.aggregate({
        _count: true,
        _sum: { amount: true },
      }),
    ]);

    return {
      totalMembers,
      activeMembers,
      totalDelegates,
      totalPayments: paymentsAgg._count,
      totalPaymentsAmount: paymentsAgg._sum.amount ?? 0,
    };
  }

  /**
   * Rapport par région :
   * - GM → toutes les régions
   * - REGION_MANAGER → uniquement ses régions actives (endAt = null)
   */
  async getRegionsReportForUser(user: JwtUserPayload) {
    let regions: { id: string; name: string }[] = [];

    if (user.role === Role.GM) {
      regions = await this.prisma.region.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      });
    } else if (user.role === Role.REGION_MANAGER) {
      const rows = await this.prisma.regionManager.findMany({
        where: { userId: user.id, endAt: null },
        select: {
          region: {
            select: { id: true, name: true },
          },
        },
      });
      regions = rows.map((r) => r.region);
    } else {
      throw new ForbiddenException('Accès réservé au GM ou aux Region Managers');
    }

    const result = await Promise.all(
      regions.map(async (region) => {
        const memberCount = await this.prisma.member.count({
          where: {
            delegate: {
              regionId: region.id,
            },
          },
        });

        const paymentsAgg = await this.prisma.payment.aggregate({
          where: {
            member: {
              delegate: {
                regionId: region.id,
              },
            },
          },
          _count: true,
          _sum: { amount: true },
        });

        return {
          regionId: region.id,
          regionName: region.name,
          memberCount,
          paymentsCount: paymentsAgg._count,
          paymentsAmount: paymentsAgg._sum.amount ?? 0,
        };
      }),
    );

    return result;
  }

  /**
   * Rapport détaillé pour un délégué donné
   */
  async getDelegateReport(delegateId: string, user: JwtUserPayload) {
    // 1) Vérifier que le délégué existe
    const delegate = await this.prisma.delegate.findUnique({
      where: { id: delegateId },
      include: {
        region: true,
        manager: {
          include: {
            user: true,
            region: true,
          },
        },
        user: true,
      },
    });

    if (!delegate) {
      throw new NotFoundException('Délégué introuvable');
    }

    // 2) Contrôle d’accès :
    // - DELEGATE ne peut voir que lui-même
    // - REGION_MANAGER et GM peuvent voir tous les délégués (MVP)
    if (user.role === Role.DELEGATE) {
      if (!user.delegateId || user.delegateId !== delegateId) {
        throw new ForbiddenException('Tu ne peux voir que ton propre rapport');
      }
    }

    // 3) Statistiques
    const memberCount = await this.prisma.member.count({
      where: { delegateId },
    });

    const paymentsAgg = await this.prisma.payment.aggregate({
      where: { delegateId },
      _count: true,
      _sum: { amount: true },
    });

    const lastPayments = await this.prisma.payment.findMany({
      where: { delegateId },
      orderBy: { paidAt: 'desc' },
      take: 20,
      include: {
        member: true,
      },
    });

    return {
      delegate: {
        id: delegate.id,
        name: delegate.name,
        phone: delegate.phone,
        region: delegate.region,
        manager: delegate.manager,
        user: delegate.user
          ? { id: delegate.user.id, email: delegate.user.email, name: delegate.user.name }
          : null,
      },
      stats: {
        memberCount,
        paymentsCount: paymentsAgg._count,
        paymentsAmount: paymentsAgg._sum.amount ?? 0,
      },
      lastPayments,
    };
  }
}
