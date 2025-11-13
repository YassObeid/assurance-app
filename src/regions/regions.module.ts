import { Module } from '@nestjs/common';
import { RegionsService } from './regions.service';
import { RegionsController } from './regions.controller';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [RegionsService, PrismaService],
  controllers: [RegionsController],
  exports: [RegionsService],
})
export class RegionsModule {}
