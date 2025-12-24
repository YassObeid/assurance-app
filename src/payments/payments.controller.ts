// src/payments/payments.controller.ts
import {
  Body,
  Controller,
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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @ApiOperation({ summary: 'Create a payment' })
  @ApiResponse({ status: 201, description: 'Payment created' })
  // Création d'un paiement : DELEGATE et GM
  @Roles(Role.DELEGATE, Role.GM)
  @Post()
  create(@Body() dto: CreatePaymentDto, @Req() req: any) {
    return this.paymentsService.create(dto, req.user);
  }

  @ApiOperation({ summary: 'Get all payments' })
  @ApiResponse({ status: 200, description: 'List of payments' })
  // Liste des paiements : DELEGATE (les siens), REGION_MANAGER (ses régions), GM (tout)
  @Roles(Role.DELEGATE, Role.REGION_MANAGER, Role.GM)
  @Get()
  findAll(@Query() q: QueryPaymentDto, @Req() req: any) {
    return this.paymentsService.findAll(q, req.user);
  }

  @ApiOperation({ summary: 'Get a payment by ID' })
  @ApiResponse({ status: 200, description: 'Payment details' })
  // Détail d'un paiement
  @Roles(Role.DELEGATE, Role.REGION_MANAGER, Role.GM)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.paymentsService.findOne(id, req.user);
  }

  @ApiOperation({ summary: 'Update a payment' })
  @ApiResponse({ status: 200, description: 'Payment updated' })
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

  // ❌ DELETE endpoint removed for audit trail protection
  // Payments are never deleted to maintain complete financial history
}
