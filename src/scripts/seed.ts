import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import { hashPassword } from '../helpers/password.helper';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting comprehensive seed...\n');

  try {
    // ========== 1) CRÉER UN SEUL GM ==========
    const gmEmail = 'gm@example.com';
    const gmPassword = 'gm123456';
    let gm = await prisma.user.findUnique({ where: { email: gmEmail } });
    if (!gm) {
      gm = await prisma.user. create({
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

    // ========== 2) CRÉER 3 RÉGIONS ==========
    const regions:  any[] = []; // ✅ TYPE DÉFINI
    const regionNames = ['Beyrouth', 'Nord', 'Sud'];

    for (const regionName of regionNames) {
      let region = await prisma.region. findUnique({ where: { name: regionName } });
      if (!region) {
        region = await prisma.region.create({
          data: { name: regionName },
        });
        console.log(`✅ Région "${regionName}" créée`);
      } else {
        console. log(`ℹ️ Région "${regionName}" déjà existante`);
      }
      regions.push(region);
    }

    // ========== 3) CRÉER 3 REGION MANAGERS (1 par région) ==========
    const managers: any[] = []; // ✅ TYPE DÉFINI
    const managerEmails = [
      'manager. beirut@example.com',
      'manager.north@example.com',
      'manager.south@example.com',
    ];

    for (let i = 0; i < managerEmails.length; i++) {
      const managerEmail = managerEmails[i];
      const managerPassword = `manager123_${i + 1}`;

      let managerUser = await prisma.user.findUnique({ where: { email: managerEmail } });
      if (!managerUser) {
        managerUser = await prisma.user.create({
          data: {
            name: `Region Manager ${i + 1}`,
            email: managerEmail,
            password: await hashPassword(managerPassword),
            role: Role.REGION_MANAGER,
          },
        });
        console.log(`✅ Manager créé : ${managerEmail} / ${managerPassword}`);
      } else {
        console.log(`ℹ️ Manager déjà existant : ${managerEmail}`);
      }

      // Assigner le manager à la région
      const existingRM = await prisma.regionManager.findFirst({
        where: {
          userId: managerUser.id,
          regionId: regions[i].id,
          endAt: null,
        },
      });

      if (!existingRM) {
        await prisma.regionManager.create({
          data: {
            userId: managerUser. id,
            regionId: regions[i].id,
          },
        });
        console.log(`✅ Manager ${i + 1} affecté à "${regions[i].name}"`);
      }

      managers.push({ user: managerUser, region:  regions[i] });
    }

    // ========== 4) CRÉER 6 DELEGATES (2 par région) ==========
    const delegates: any[] = []; // ✅ TYPE DÉFINI
    let delegateCounter = 1;

    for (let regionIdx = 0; regionIdx < regions.length; regionIdx++) {
      const region = regions[regionIdx];
      const manager = managers[regionIdx];

      for (let delegateIdx = 0; delegateIdx < 2; delegateIdx++) {
        const delegateEmail = `delegate.${region.name. toLowerCase()}.${delegateIdx + 1}@example.com`;
        const delegatePassword = `delegate123_${delegateCounter}`;

        let delegateUser = await prisma.user.findUnique({
          where: { email: delegateEmail },
        });
        if (!delegateUser) {
          delegateUser = await prisma.user.create({
            data: {
              name: `Délégué ${delegateCounter}`,
              email: delegateEmail,
              password: await hashPassword(delegatePassword),
              role: Role.DELEGATE,
            },
          });
          console.log(`✅ Delegate créé : ${delegateEmail} / ${delegatePassword}`);
        } else {
          console. log(`ℹ️ Delegate déjà existant :  ${delegateEmail}`);
        }

        // Créer l'entité Delegate
        let delegate = await prisma.delegate. findFirst({
          where: {
            name: `Délégué ${delegateCounter}`,
            regionId: region.id,
          },
        });

        if (!delegate) {
          const rm = await prisma.regionManager.findFirst({
            where: {
              userId: manager.user.id,
              regionId: region.id,
              endAt: null,
            },
          });

          if (rm) {
            delegate = await prisma.delegate.create({
              data: {
                name:  `Délégué ${delegateCounter}`,
                phone: `06000000${delegateCounter. toString().padStart(2, '0')}`,
                regionId: region.id,
                managerId: rm.id,
                userId: delegateUser.id,
              },
            });
            console.log(`✅ Delegate ${delegateCounter} créé dans "${region.name}" avec user associé`);
          }
        }

        if (delegate) {
          delegates. push(delegate);
        }
        delegateCounter++;
      }
    }

    // ========== 5) CRÉER DES MEMBERS PAR DELEGATE ==========
    let memberCounter = 1;
    for (let i = 0; i < delegates. length; i++) {
      const delegate = delegates[i];

      for (let j = 0; j < 2; j++) {
        const cin = `TEST${(i + 1).toString().padStart(2, '0')}${(j + 1).toString().padStart(2, '0')}`;
        let member = await prisma.member. findFirst({
          where: { cin },
        });

        if (!member) {
          member = await prisma.member.create({
            data: {
              cin,
              fullName: `Member ${memberCounter}`,
              status: 'ACTIVE',
              delegateId: delegate.id,
            },
          });
          console.log(`✅ Member ${memberCounter} créé pour Delegate ${i + 1}`);
        }

        memberCounter++;
      }
    }

    // ========== 6) CRÉER DES PAYMENTS ==========
    const members = await prisma.member.findMany();
    let paymentCounter = 0;

    for (const member of members) {
      const existingPayment = await prisma. payment.findFirst({
        where: { memberId: member.id },
      });

      if (!existingPayment) {
        const amount = (100 + Math.random() * 900).toFixed(2);
        await prisma.payment.create({
          data: {
            memberId: member.id,
            delegateId: member.delegateId,
            amount:  amount,
            paidAt: new Date(),
          },
        });
        paymentCounter++;
      }
    }
    console.log(`✅ ${paymentCounter} Payments créés`);

    // ========== RÉSUMÉ ==========
    console.log('\n✨ Seed terminé avec succès ! \n');
    console.log('📊 Récapitulatif des données créées: ');
    console.log('  - 1x GM (super admin)');
    console.log('  - 3x Régions (Beyrouth, Nord, Sud)');
    console.log('  - 3x Region Managers (1 par région)');
    console.log('  - 6x Délégués (2 par région)');
    console.log('  - 12x Membres (2 par délégué)');
    console.log('  - 12x Paiements\n');

    console.log('📝 Comptes pour tester les rôles :\n');
    console.log('🔐 GM (super admin):');
    console.log(`  Email :  ${gmEmail}`);
    console.log(`  Password : ${gmPassword}`);
    console.log('  Peut :  voir tout, gérer régions, managers, délégués\n');

    console.log('🔐 Region Managers:');
    for (let i = 0; i < managerEmails.length; i++) {
      console.log(`  Email : ${managerEmails[i]}`);
      console.log(`  Password : manager123_${i + 1}`);
      console.log(`  Région : ${regions[i].name}`);
      console.log('  Peut : gérer délégués et membres de sa région\n');
    }

    console.log('🔐 Délégués:');
    for (let i = 0; i < delegates.length; i++) {
      const delegateIdx = i + 1;
      const regionIdx = Math.floor(i / 2);
      const regionName = regions[regionIdx].name;
      console.log(`  Email : delegate.${regionName. toLowerCase()}.${(i % 2) + 1}@example.com`);
      console.log(`  Password : delegate123_${delegateIdx}`);
      console.log(`  Région : ${regionName}`);
      console.log('  Peut : voir ses membres et paiements\n');
    }

    console.log('\n🎯 Scénarios de test:\n');
    console.log('1️⃣  Login comme GM → Voir toutes les régions et managers');
    console.log('2️⃣  Login comme Manager Beyrouth → Voir délégués de Beyrouth seulement');
    console.log('3️⃣  Login comme Manager Nord → Voir délégués du Nord seulement');
    console.log('4️⃣  Login comme Delegate → Voir ses membres et paiements seulement');
    console.log('5️⃣  Tester les permissions (manager ne peut pas créer de région)');
    console.log('6️⃣  Tester les permissions (delegate ne peut pas voir d\'autres délégués)');
  } catch (error) {
    console.error('❌ Seed error', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('Erreur fatale :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });