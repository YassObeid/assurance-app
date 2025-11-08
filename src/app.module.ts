import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DelegatesModule } from './delegates/delegates.module';
import { PrismaModule } from './prisma.module';
import { MembersModule } from './members/members.module';

@Module({
  imports: [PrismaModule, DelegatesModule, MembersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
