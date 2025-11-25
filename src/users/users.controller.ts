// src/users/users.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly service: UsersService) {}

  /**
   * ONLY GM can create users (e.g., managers, delegates, GM)
   */
  @Roles(Role.GM)
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.service.create(dto);
  }

  /**
   * ONLY GM can see list of all users
   */
  @Roles(Role.GM)
  @Get()
  getAll() {
    return this.service.findAll();
  }

  /**
   * ONLY GM can see a specific user
   */
  @Roles(Role.GM)
  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  /**
   * ONLY GM can update a user (password, role, etc.)
   */
  @Roles(Role.GM)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.service.update(id, dto);
  }

  /**
   * ONLY GM can soft delete a user
   */
  @Roles(Role.GM)
  @Delete(':id')
  softDelete(@Param('id') id: string) {
    return this.service.softDelete(id);
  }
}
