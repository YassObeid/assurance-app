// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { comparePassword } from '../common/user.helpers';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwt: JwtService,
  ) {}

  // Vérifie email + mot de passe
  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user || !user.password) {
      throw new UnauthorizedException('Email ou mot de passe invalide');
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Email ou mot de passe invalide');
    }

    if (user.deletedAt) {
      throw new UnauthorizedException('Compte désactivé');
    }

    // On ne retourne que ce qui est utile pour le JWT
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as Role,
    };
  }

  // Génère le JWT à partir d'un user déjà validé
  async login(user: { id: string; email: string; role: Role; name: string }) {
    const payload: any = {
      sub: user.id,
      role: user.role,
      email: user.email,
    };

    return {
      access_token: await this.jwt.signAsync(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
