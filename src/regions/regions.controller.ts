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
import { RegionsService } from './regions.service';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('regions')
export class RegionsController {
  constructor(private readonly service: RegionsService) {}

  // Seul le GM crée les régions
  @Roles(Role.GM)
  @Post()
  create(@Body() dto: CreateRegionDto) {
    return this.service.create(dto);
  }

  // Tous les rôles peuvent lister les régions
  @Roles(Role.GM, Role.REGION_MANAGER, Role.DELEGATE)
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Roles(Role.GM, Role.REGION_MANAGER, Role.DELEGATE)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Roles(Role.GM)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRegionDto) {
    return this.service.update(id, dto);
  }

  @Roles(Role.GM)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}

