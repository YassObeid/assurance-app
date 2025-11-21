// src/auth/roles.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { Role } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
      ROLES_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );
    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // pas de rôle demandé → route ouverte à tout user connecté
    }

    const request = ctx.switchToHttp().getRequest();
    const user = request.user; // injecté par JwtStrategy

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Accès refusé pour ce rôle');
    }
    return true;
  }
}
