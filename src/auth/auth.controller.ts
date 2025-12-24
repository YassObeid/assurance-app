import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto'; // ✅ AJOUTE
import { JwtAuthGuard } from './jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful, returns JWT token' })
  @ApiResponse({ status: 429, description: 'Too many requests - rate limit exceeded' })
  // ✅ Strict rate limiting for login: 5 attempts per 15 minutes
  @Throttle({ default: { limit: 5, ttl: 900000 } }) // 15 minutes = 900000ms
  @Post('login')
  async login(@Body() dto: LoginDto) { // ✅ CHANGE :  body -> dto:  LoginDto
    const user = await this.authService.validateUser(dto.email, dto.password);
    return this.authService.login(user);
  }

  @ApiOperation({ summary: 'Get current user info' })
  @ApiResponse({ status: 200, description: 'Current user' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: any) {
    return req.user;
  }
}