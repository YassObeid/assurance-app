import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DelegatesModule } from './delegates/delegates.module';
import { PrismaModule } from './prisma.module';
import { MembersModule } from './members/members.module';
import { RegionsModule } from './regions/regions.module';
import { ManagersModule } from './managers/managers.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [PrismaModule, DelegatesModule, MembersModule, RegionsModule, ManagersModule, UsersModule, AuthModule, PaymentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
