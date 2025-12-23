import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger'; // ✅ AJOUTE
import { ManagersService } from './managers.service';
import { CreateManagerDto } from './dto/create-manager.dto';
import { UpdateManagerDto } from './dto/update-manager.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '@prisma/client';

@ApiTags('Managers') // ✅ AJOUTE
@ApiBearerAuth() // ✅ AJOUTE
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('managers')
export class ManagersController {
  constructor(private readonly service:  ManagersService) {}

  @ApiOperation({ summary: 'Create a manager (GM only)' }) // ✅ AJOUTE
  @ApiResponse({ status: 201, description: 'Manager created' }) // ✅ AJOUTE
  @Roles(Role.GM)
  @Post()
  create(@Body() dto: CreateManagerDto) {
    return this.service.create(dto);
  }

  @ApiOperation({ summary:  'Get all managers (GM only)' }) // ✅ AJOUTE
  @ApiResponse({ status: 200, description: 'List of managers' }) // ✅ AJOUTE
  @Roles(Role.GM)
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @ApiOperation({ summary:  'Get a manager by ID (GM only)' }) // ✅ AJOUTE
  @Roles(Role.GM)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @ApiOperation({ summary: 'Update a manager (GM only)' }) // ✅ AJOUTE
  @Roles(Role.GM)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateManagerDto) {
    return this.service.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete a manager (GM only)' }) // ✅ AJOUTE
  @Roles(Role.GM)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}