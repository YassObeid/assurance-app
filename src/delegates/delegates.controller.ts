import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger'; // ✅ AJOUTE
import { DelegatesService } from './delegates.service';
import { CreateDelegateDto } from './dto/create-delegate.dto';
import { UpdateDelegateDto } from './dto/update-delegate.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '@prisma/client';

@ApiTags('Delegates') // ✅ AJOUTE
@ApiBearerAuth() // ✅ AJOUTE - Indique que les routes sont protégées
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('delegates')
export class DelegatesController {
  constructor(private readonly delegatesService: DelegatesService) {}

  @ApiOperation({ summary: 'Get all delegates' }) // ✅ AJOUTE
  @ApiResponse({ status: 200, description: 'List of delegates' }) // ✅ AJOUTE
  @Roles(Role.GM, Role.REGION_MANAGER)
  @Get()
  findAll(@Req() req: any) {
    return this.delegatesService.findAllForUser(req.user);
  }

  @ApiOperation({ summary: 'Create a delegate' }) // ✅ AJOUTE
  @ApiResponse({ status: 201, description:  'Delegate created' }) // ✅ AJOUTE
  @Roles(Role.GM)
  @Post()
  create(@Body() dto: CreateDelegateDto) {
    return this.delegatesService.create(dto);
  }

  @ApiOperation({ summary:  'Get a delegate by ID' }) // ✅ AJOUTE
  @Roles(Role.GM, Role.REGION_MANAGER)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.delegatesService.findOneForUser(id, req.user);
  }

  @ApiOperation({ summary:  'Update a delegate' }) // ✅ AJOUTE
  @Roles(Role. GM)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDelegateDto) {
    return this.delegatesService.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete a delegate' }) // ✅ AJOUTE
  @Roles(Role.GM)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.delegatesService.remove(id);
  }
}