import { Module } from '@nestjs/common';
import { DelegatesService } from './delegates.service';
import { DelegatesController } from './delegates.controller';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [PrismaModule], // ← on l’importe
  controllers: [DelegatesController],
  providers: [DelegatesService], // plus besoin d’ajouter PrismaService ici
})
export class DelegatesModule {}
