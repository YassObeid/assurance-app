// src/common/region-access.helper.ts
import { PrismaClient } from '@prisma/client';

// PrismaService *extends* PrismaClient, donc on tape sur le type de base
export async function currentRegionIdsForManager(
  prisma: PrismaClient,
  userId: string,
): Promise<string[]> {
  const now = new Date();
  const rows = await prisma.regionManager.findMany({
    where: {
      userId,
      startAt: {
        lte: now, // doit avoir commencé
      },
      OR: [
        { endAt: null }, // pas de date de fin = actif indéfiniment
        { endAt: { gte: now } }, // ou date de fin dans le futur
      ],
    },
    select: { regionId: true },
  });

  return rows.map(r => r.regionId);
}
