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
import { ReportsModule } from './reports/reports.module';
import { ConfigModule } from '@nestjs/config';
import { SystemController } from './system/system.controller';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // ✅ Rate limiting global: 10 requests per 60 seconds
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds
        limit: 10, // 10 requests per TTL
      },
    ]),
    PrismaModule,
    DelegatesModule,
    MembersModule,
    RegionsModule,
    ManagersModule,
    UsersModule,
    AuthModule,
    PaymentsModule,
    ReportsModule,
  ],
  controllers: [AppController, SystemController],
  providers: [
    AppService,
    // ✅ Apply throttler globally
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
