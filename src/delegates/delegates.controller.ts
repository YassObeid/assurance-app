import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { DelegatesService } from './delegates.service';
import { CreateDelegateDto } from './dto/create-delegate.dto';

@Controller('delegates')
export class DelegatesController {
  constructor(private readonly delegatesService: DelegatesService) {}

  @Get()
  findAll() {
    return this.delegatesService.findAll();
  }

  @Post()
  create(@Body() data: any) {
    return this.delegatesService.create(data);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.delegatesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.delegatesService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.delegatesService.remove(id);
  }
}
