// src/common/types/request-user.type.ts
import { Role } from '@prisma/client';

export interface RequestUser {
  userId: string;
  role: Role;
  email?: string;
  delegateId?: string;
  managerRegionIds?: string[];
}
