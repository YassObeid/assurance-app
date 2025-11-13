import { Body, Controller, Get, Post } from '@nestjs/common';
import { RegionsService } from './regions.service';
import { CreateRegionDto } from './dto/create-region.dto';

@Controller('regions')
export class RegionsController {
  constructor(private readonly service: RegionsService) {}

  @Post()
  create(@Body() dto: CreateRegionDto) {
    return this.service.create(dto);
  }

  @Get()
  list() {
    return this.service.findAll();
  }
}

