import { Body, Controller, Get, Post } from '@nestjs/common';
import { ManagersService } from './managers.service';
import { CreateManagerDto } from './dto/create-manager.dto';

@Controller('managers')
export class ManagersController {
  constructor(private readonly service: ManagersService) {}

  @Post()
  create(@Body() dto: CreateManagerDto) {
    return this.service.create(dto);
  }

  @Get()
  list() {
    return this.service.findAll();
  }
}
