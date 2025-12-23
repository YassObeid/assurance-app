// src/common/auth.helpers.ts
import { PrismaClient } from '@prisma/client';

/**
 * Get the delegateId for a user (if they are a DELEGATE role)
 */
export async function delegateIdForUser(
  prisma: PrismaClient,
  userId: string,
): Promise<string | null> {
  const delegate = await prisma.delegate.findFirst({
    where: { userId, deletedAt: null },
    select: { id: true },
  });
  return delegate?.id ?? null;
}

/**
 * Get active region IDs for a manager
 */
export async function currentRegionIdsForManager(
  prisma: PrismaClient,
  userId: string,
): Promise<string[]> {
  const rows = await prisma.regionManager.findMany({
    where: {
      userId,
      endAt: null, // only active assignments
    },
    select: { regionId: true },
  });
  return rows.map((r) => r.regionId);
}

/**
 * Ensure a delegate owns a specific member
 * Throws ForbiddenException if not
 */
export async function ensureDelegateOwnsMember(
  prisma: PrismaClient,
  delegateId: string,
  memberId: string,
): Promise<void> {
  const member = await prisma.member.findFirst({
    where: { id: memberId, delegateId },
  });
  
  if (!member) {
    const { ForbiddenException } = await import('@nestjs/common');
    throw new ForbiddenException('Ce membre ne vous appartient pas');
  }
}

/**
 * Get manager IDs for a specific region manager user
 */
export async function getActiveManagerIdsForUser(
  prisma: PrismaClient,
  userId: string,
): Promise<string[]> {
  const managers = await prisma.regionManager.findMany({
    where: {
      userId,
      endAt: null,
    },
    select: { id: true },
  });
  return managers.map((m) => m.id);
}
