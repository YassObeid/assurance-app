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
import { DelegatesService } from './delegates.service';
import { CreateDelegateDto } from './dto/create-delegate.dto';
import { UpdateDelegateDto } from './dto/update-delegate.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('delegates')
export class DelegatesController {
  constructor(private readonly delegatesService: DelegatesService) {}

  // GM + REGION_MANAGER + DELEGATE peuvent voir les délégués accessibles
  @Roles(Role.GM, Role.REGION_MANAGER, Role.DELEGATE)
  @Get()
  findAll(@Req() req: any) {
    return this.delegatesService.findAllForUser(req.user);
  }

  // Seul le GM crée les délégués
  @Roles(Role.GM)
  @Post()
  create(@Body() dto: CreateDelegateDto) {
    return this.delegatesService.create(dto);
  }

  @Roles(Role.GM, Role.REGION_MANAGER, Role.DELEGATE)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.delegatesService.findOneForUser(id, req.user);
  }

  @Roles(Role.GM)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDelegateDto) {
    return this.delegatesService.update(id, dto);
  }

  @Roles(Role.GM)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.delegatesService.remove(id);
  }
}
