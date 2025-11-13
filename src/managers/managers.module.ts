import { Module } from '@nestjs/common';
import { ManagersService } from './managers.service';
import { ManagersController } from './managers.controller';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [ManagersService, PrismaService],
  controllers: [ManagersController],
  exports: [ManagersService],
})
export class ManagersModule {}
