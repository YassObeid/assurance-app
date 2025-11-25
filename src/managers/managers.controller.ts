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
import { ManagersService } from './managers.service';
import { CreateManagerDto } from './dto/create-manager.dto';
import { UpdateManagerDto } from './dto/update-manager.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('managers')
export class ManagersController {
  constructor(private readonly service: ManagersService) {}

  @Roles(Role.GM)
  @Post()
  create(@Body() dto: CreateManagerDto) {
    return this.service.create(dto);
  }

  @Roles(Role.GM)
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Roles(Role.GM)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Roles(Role.GM)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateManagerDto) {
    return this.service.update(id, dto);
  }

  @Roles(Role.GM)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}

