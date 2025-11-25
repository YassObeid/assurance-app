// src/auth/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';

// Exemple : @Roles(Role.GM, Role.REGION_MANAGER)
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
