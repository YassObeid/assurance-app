// src/scripts/seed.ts
import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import { hashPassword } from '../common/user.helpers';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting seed...');

  // 1) GM
  const gmEmail = 'gm@example.com';
  const gmPassword = 'gm123456';
  let gm = await prisma.user.findUnique({ where: { email: gmEmail } });
  if (!gm) {
    gm = await prisma.user.create({
      data: {
        name: 'Global Manager',
        email: gmEmail,
        password: await hashPassword(gmPassword),
        role: Role.GM,
      },
    });
    console.log(`✅ GM créé : ${gmEmail} / ${gmPassword}`);
  } else {
    console.log(`ℹ️ GM déjà existant : ${gmEmail}`);
  }

  // 2) Région
  let region = await prisma.region.findUnique({ where: { name: 'Beyrouth' } });
  if (!region) {
    region = await prisma.region.create({
      data: { name: 'Beyrouth' },
    });
    console.log('✅ Région "Beyrouth" créée');
  } else {
    console.log('ℹ️ Région "Beyrouth" déjà existante');
  }

  // 3) Manager user
  const managerEmail = 'manager@example.com';
  const managerPassword = 'manager123';
  let managerUser = await prisma.user.findUnique({ where: { email: managerEmail } });
  if (!managerUser) {
    managerUser = await prisma.user.create({
      data: {
        name: 'Region Manager 1',
        email: managerEmail,
        password: await hashPassword(managerPassword),
        role: Role.REGION_MANAGER,
      },
    });
    console.log(`✅ Manager user créé : ${managerEmail} / ${managerPassword}`);
  } else {
    console.log(`ℹ️ Manager user déjà existant : ${managerEmail}`);
  }

  // 4) Affectation RegionManager
  const existingRM = await prisma.regionManager.findFirst({
    where: { userId: managerUser.id, regionId: region.id, endAt: null },
  });
  if (!existingRM) {
    await prisma.regionManager.create({
      data: {
        userId: managerUser.id,
        regionId: region.id,
      },
    });
    console.log('✅ Affectation RegionManager créée');
  } else {
    console.log('ℹ️ RegionManager déjà affecté à cette région');
  }

  // 5) Delegate
  let delegate = await prisma.delegate.findFirst({
    where: { name: 'Delegate 1', regionId: region.id },
  });
  if (!delegate) {
    delegate = await prisma.delegate.create({
      data: {
        name: 'Delegate 1',
        phone: '0600000000',
        regionId: region.id,
        managerId: (await prisma.regionManager.findFirst({
          where: { userId: managerUser.id, regionId: region.id, endAt: null },
        }))!.id,
      },
    });
    console.log('✅ Delegate 1 créé dans "Beyrouth"');
  } else {
    console.log('ℹ️ Delegate 1 déjà existant');
  }

  console.log('🌱 Seed terminé.');
}

main()
  .catch((e) => {
    console.error('❌ Seed error', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
