import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { Role } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    // Rôles attendus sur la route (@Roles(...))
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    // Si rien n'est défini → pas de filtre
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Récupération de l'utilisateur injecté par JwtStrategy
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as { role?: Role };

    if (!user || !user.role) {
      throw new ForbiddenException('Utilisateur non authentifié ou sans rôle');
    }

    // Vérifie si son rôle est dans la liste autorisée
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Accès refusé pour ce rôle');
    }

    return true;
  }
}
