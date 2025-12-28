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
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger'; // ✅ AJOUTE
import { RegionsService } from './regions.service';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '@prisma/client';

@ApiTags('Regions') // ✅ AJOUTE
@ApiBearerAuth() // ✅ AJOUTE
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('regions')
export class RegionsController {
  constructor(private readonly service: RegionsService) {}

  @ApiOperation({ summary: 'Create a region (GM only)' }) // ✅ AJOUTE
  @ApiResponse({ status: 201, description: 'Region created' }) // ✅ AJOUTE
  @Roles(Role.GM)
  @Post()
  create(@Body() dto: CreateRegionDto) {
    return this.service.create(dto);
  }

  @ApiOperation({ summary: 'Get all regions' }) // ✅ AJOUTE
  @ApiResponse({ status: 200, description: 'List of regions' }) // ✅ AJOUTE
  @Roles(Role.GM, Role.REGION_MANAGER, Role.DELEGATE)
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @ApiOperation({ summary: 'Get a region by ID' }) // ✅ AJOUTE
  @Roles(Role.GM, Role.REGION_MANAGER, Role.DELEGATE)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @ApiOperation({ summary: 'Update a region (GM only)' }) // ✅ AJOUTE
  @Roles(Role.GM)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRegionDto) {
    return this.service.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete a region (GM only)' }) // ✅ AJOUTE
  @Roles(Role.GM)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
