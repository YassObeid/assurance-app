import { Controller, Get, Post, Body, Param, Delete, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { QueryMemberDto } from './dto/query-member.dto';

@Controller('members')
@UsePipes(new ValidationPipe({ whitelist:true, transform:true }))
export class MembersController {
  constructor(private readonly service: MembersService) {}

  @Post()
  create(@Body() dto: CreateMemberDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() q: QueryMemberDto) {
    return this.service.findAll(q);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
