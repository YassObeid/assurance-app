// src/payments/payments.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { QueryPaymentDto } from './dto/query-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';


@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}


  // Création d'un paiement : seulement DELEGATE
  @Roles(Role.DELEGATE)
  @Post()
  create(@Body() dto: CreatePaymentDto, @Req() req: any) {
    return this.paymentsService.create(dto, req.user);
  }


  // Liste des paiements : DELEGATE (les siens), REGION_MANAGER (ses régions), GM (tout)
  @Roles(Role.DELEGATE, Role.REGION_MANAGER, Role.GM)
  @Get()
  findAll(@Query() q: QueryPaymentDto, @Req() req: any) {
    return this.paymentsService.findAll(q, req.user);
  }


  // Détail d'un paiement
  @Roles(Role.DELEGATE, Role.REGION_MANAGER, Role.GM)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.paymentsService.findOne(id, req.user);
  }


  // Mise à jour : DELEGATE (ses paiements) + GM
  @Roles(Role.DELEGATE, Role.GM)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePaymentDto,
    @Req() req: any,
  ) {
    return this.paymentsService.update(id, dto, req.user);
  }


  // Suppression : DELEGATE (ses paiements) + GM
  @Roles(Role.DELEGATE, Role.GM)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.paymentsService.remove(id, req.user);
  }
}
