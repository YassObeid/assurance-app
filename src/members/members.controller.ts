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
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { QueryMemberDto } from './dto/query-member.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  // Un délégué voit seulement SES membres, un region manager ceux de ses régions, le GM voit tout
  @Roles(Role.DELEGATE, Role.REGION_MANAGER, Role.GM)
  @Get()
  findAll(@Query() q: QueryMemberDto, @Req() req: any) {
    return this.membersService.findAll(q, req.user);
  }

  @Roles(Role.DELEGATE)
  @Post()
  create(@Body() dto: CreateMemberDto, @Req() req: any) {
    return this.membersService.create(dto, req.user);
  }

  @Roles(Role.DELEGATE, Role.REGION_MANAGER, Role.GM)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.membersService.findOne(id, req.user);
  }

  @Roles(Role.DELEGATE, Role.GM)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: CreateMemberDto,
    @Req() req: any,
  ) {
    return this.membersService.update(id, dto, req.user);
  }

  @Roles(Role.DELEGATE, Role.GM)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.membersService.remove(id, req.user);
  }
}
