// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { comparePassword } from '../common/user.helpers'; // on réutilise ton helper

import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Vérifie email + mot de passe, renvoie l'utilisateur sans le password
   */
  public async validateUser(email: string, plainPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe invalide');
    }

    const ok = await comparePassword(plainPassword, user.password);
    if (!ok) {
      throw new UnauthorizedException('Email ou mot de passe invalide');
    }

    const { password, ...safeUser } = user;
    return safeUser;
  }

    async login(user: { id: string; email: string; role: Role }) {
    const payload: any = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    // Si c'est un délégué, on va chercher son delegateId
    if (user.role === Role.DELEGATE) {
      const delegate = await this.prisma.delegate.findFirst({
        where: { userId: user.id },
        select: { id: true },
      });
      if (delegate) {
        payload.delegateId = delegate.id;
      }
    }

    return {
      access_token: this.jwtService.sign(payload),
    };
  
}
}


