import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // 1. Créer un utilisateur GM
  const gmUser = await prisma.user. upsert({
    where: { email: 'gm@example.com' },
    update: {},
    create: {
      name: 'Admin GM',
      email: 'gm@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'GM',
    },
  });
  console.log(`✅ GM User créé : ${gmUser.email}`);

  // 2. Créer un utilisateur REGION_MANAGER
  const rmUser = await prisma.user. upsert({
    where:  { email: 'manager@example.com' },
    update: {},
    create: {
      name: 'Manager Région',
      email: 'manager@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'REGION_MANAGER',
    },
  });
  console.log(`✅ REGION_MANAGER User créé :  ${rmUser.email}`);

  // 3. Créer un utilisateur DELEGATE
  const delegateUser = await prisma.user.upsert({
    where: { email: 'delegate@example.com' },
    update: {},
    create: {
      name: 'Délégué Test',
      email: 'delegate@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'DELEGATE',
    },
  });
  console.log(`✅ DELEGATE User créé : ${delegateUser. email}`);

  // 4. Créer une Région
  const region = await prisma.region.upsert({
    where: { name: 'Région Nord' },
    update: {},
    create: {
      name:  'Région Nord',
    },
  });
  console.log(`✅ Région créée : ${region.name}`);

  // 5. Créer un RegionManager
  const regionManager = await prisma.regionManager.upsert({
    where: {
      userId_regionId_startAt: {
        userId: rmUser.id,
        regionId: region.id,
        startAt: new Date(),
      },
    },
    update: {},
    create: {
      userId: rmUser.id,
      regionId: region. id,
      startAt: new Date(),
      endAt: null,
    },
  });
  console.log(`✅ RegionManager créé : ${rmUser.email} -> ${region.name}`);

  // 6. Créer un Delegate
  const delegate = await prisma.delegate.upsert({
    where: { id: 'delegate-1' },
    update: {},
    create: {
      id: 'delegate-1',
      name: 'Délégué Principal',
      phone: '0123456789',
      regionId: region.id,
      managerId: regionManager.id,
      userId: delegateUser.id,
    },
  });
  console.log(`✅ Delegate créé : ${delegate.name}`);

  // 7. Créer un Member
  const member = await prisma.member.upsert({
    where: { cin: 'TEST123456' },
    update: {},
    create: {
      cin: 'TEST123456',
      fullName: 'John Doe',
      status: 'ACTIVE',
      delegateId: delegate.id,
    },
  });
  console.log(`✅ Member créé : ${member.fullName}`);

  // 8. Créer un Payment
  const payment = await prisma.payment.upsert({
    where: { id: 'payment-1' },
    update: {},
    create: {
      id: 'payment-1',
      memberId: member.id,
      delegateId: delegate.id,
      amount: '500.00',
      paidAt: new Date(),
    },
  });
  console.log(`✅ Payment créé : ${payment.amount}`);

  console.log('\n✨ Seeding terminé ! \n');
  console.log('📝 Comptes créés pour les tests :');
  console.log('  - GM :  gm@example.com / password123');
  console.log('  - REGION_MANAGER : manager@example.com / password123');
  console.log('  - DELEGATE : delegate@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Erreur seeding :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });