import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger'; // ✅ AJOUTE
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { QueryMemberDto } from './dto/query-member.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '@prisma/client';

@ApiTags('Members') // ✅ AJOUTE
@ApiBearerAuth() // ✅ AJOUTE
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @ApiOperation({ summary: 'Get all members' }) // ✅ AJOUTE
  @ApiResponse({ status: 200, description: 'List of members' }) // ✅ AJOUTE
  @Roles(Role. DELEGATE, Role.REGION_MANAGER, Role.GM)
  @Get()
  findAll(@Query() q: QueryMemberDto, @Req() req: any) {
    return this.membersService. findAll(q, req.user);
  }

  @ApiOperation({ summary: 'Create a member' }) // ✅ AJOUTE
  @ApiResponse({ status: 201, description:  'Member created' }) // ✅ AJOUTE
  @Roles(Role. DELEGATE)
  @Post()
  create(@Body() dto: CreateMemberDto, @Req() req: any) {
    return this.membersService.create(dto, req. user);
  }

  @ApiOperation({ summary: 'Get a member by ID' }) // ✅ AJOUTE
  @Roles(Role. DELEGATE, Role.REGION_MANAGER, Role.GM)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.membersService.findOne(id, req.user);
  }

  @ApiOperation({ summary: 'Update a member' }) // ✅ AJOUTE
  @Roles(Role.DELEGATE, Role.GM)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: CreateMemberDto,
    @Req() req: any,
  ) {
    return this.membersService.update(id, dto, req.user);
  }

  @ApiOperation({ summary: 'Delete a member' }) // ✅ AJOUTE
  @Roles(Role.DELEGATE, Role.GM)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.membersService.remove(id, req.user);
  }
}