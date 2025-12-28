// src/common/region-access.helper.ts
import { PrismaClient } from '@prisma/client';

// PrismaService *extends* PrismaClient, donc on tape sur le type de base
export async function currentRegionIdsForManager(
  prisma: PrismaClient,
  userId: string,
): Promise<string[]> {
  const rows = await prisma.regionManager.findMany({
    where: {
      userId,
      endAt: null, // seulement les affectations encore actives
    },
    select: { regionId: true },
  });

  return rows.map((r) => r.regionId);
}
