// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from '../prisma.service';
@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'change-me-in-prod',
      signOptions: {
        expiresIn: (process.env.JWT_EXPIRES_IN ?? '1h') as unknown as import('jsonwebtoken').SignOptions['expiresIn'],
      },
    }),
  ],
  providers: [AuthService, PrismaService,JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService,PrismaService],
})
export class AuthModule {}

