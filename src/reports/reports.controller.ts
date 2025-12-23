import {
  Controller,
  Get,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /**
   * Résumé global :  GM uniquement
   */
  @Roles(Role.GM)
  @Get('summary')
  async getSummary() {
    return this.reportsService.getGlobalSummary();
  }

  /**
   * Rapport par région : 
   * - GM : toutes les régions
   * - REGION_MANAGER : seulement ses régions
   */
  @Roles(Role. GM, Role.REGION_MANAGER)
  @Get('regions')
  async getRegionsReport(@Req() req: any) {
    const user = {
      userId: req.user. id,  // ✅ CHANGÉ : id → userId
      role: req. user.role,
    };
    return this.reportsService. getRegionsReportForUser(user);
  }

  /**
   * Rapport détaillé pour un délégué
   */
  @Roles(Role.GM, Role.REGION_MANAGER, Role.DELEGATE)
  @Get('delegates/:id')
  async getDelegateReport(@Param('id') id: string, @Req() req: any) {
    const user = {
      userId: req. user.id,  // ✅ CHANGÉ : id → userId
      role: req.user.role,
      delegateId: req.user.delegateId,
    };
    return this.reportsService.getDelegateReport(id, user);
  }
}