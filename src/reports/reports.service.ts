import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Role } from '@prisma/client';
import { currentRegionIdsForManager } from '../common/region-access.helper';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getGlobalSummary() {
    const totalMembers = await this.prisma. member.count();
    const totalPayments = await this.prisma.payment.aggregate({
      _sum: { amount:  true },
    });

    return {
      totalMembers,
      totalPaymentsAmount: totalPayments._sum. amount || 0,
    };
  }

  async getRegionsReportForUser(user: { userId: string; role: Role }) {
    if (user.role === 'GM') {
      const regions = await this.prisma.region.findMany({
        include: {
          managers: true,
          delegates: true,
        },
      });
      return regions;
    }

    if (user.role === 'REGION_MANAGER') {
      const regionIds = await currentRegionIdsForManager(this.prisma, user.userId);
      if (regionIds.length === 0) return [];

      const regions = await this.prisma.region.findMany({
        where: { id: { in: regionIds } },
        include: {
          managers: true,
          delegates: true,
        },
      });
      return regions;
    }

    throw new ForbiddenException('Rôle non autorisé');
  }

  async getDelegateReport(delegateId: string, user: { userId: string; role: Role; delegateId?:  string }) {
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

    if (user. role === Role.DELEGATE) {
      if (! user.delegateId || user.delegateId !== delegateId) {
        throw new ForbiddenException('Accès refusé');
      }
    } else if (user.role === Role.REGION_MANAGER) {
      const regionIds = await currentRegionIdsForManager(this.prisma, user.userId);
      if (!regionIds.includes(delegate.regionId)) {
        throw new ForbiddenException('Accès refusé');
      }
    } else if (user.role !== Role.GM) {
      throw new ForbiddenException('Rôle non autorisé');
    }

    return delegate;
  }
}