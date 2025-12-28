import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const request = require('supertest'); // require pour éviter le problème d'import ESM

describe('Assurance API E2E', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let server: any;

  let gmToken: string;
  let delegateToken: string;
  let regionId: string;
  let delegateId: string;
  let memberId: string;

  beforeAll(async () => {
    prisma = new PrismaClient();

    await prisma.payment.deleteMany();
    await prisma.member.deleteMany();
    await prisma.delegate.deleteMany();
    await prisma.regionManager.deleteMany();
    await prisma.region.deleteMany();
    await prisma.user.deleteMany();

    const gmPassword = await bcrypt.hash('gm-pass', 10);
    const delegatePassword = await bcrypt.hash('delegate-pass', 10);

    const gm = await prisma.user.create({
      data: {
        name: 'GM Test',
        email: 'gm@example.com',
        password: gmPassword,
        role: Role.GM,
      },
    });

    const delegateUser = await prisma.user.create({
      data: {
        name: 'Delegate Test',
        email: 'delegate@example.com',
        password: delegatePassword,
        role: Role.DELEGATE,
      },
    });

    const region = await prisma.region.create({ data: { name: 'Beyrouth' } });
    regionId = region.id;

    const managerUser = await prisma.user.create({
      data: {
        name: 'Manager Test',
        email: 'manager@example.com',
        password: await bcrypt.hash('manager-pass', 10),
        role: Role.REGION_MANAGER,
      },
    });

    const manager = await prisma.regionManager.create({
      data: { userId: managerUser.id, regionId },
    });

    const delegate = await prisma.delegate.create({
      data: {
        name: 'Délégué Beyrouth',
        phone: '0100000000',
        regionId,
        managerId: manager.id,
        userId: delegateUser.id,
      },
    });
    delegateId = delegate.id;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    server = app.getHttpServer();

    const gmLogin = await request(server)
      .post('/auth/login')
      .send({ email: 'gm@example.com', password: 'gm-pass' })
      .expect(201);
    gmToken = gmLogin.body.access_token;

    const delegateLogin = await request(server)
      .post('/auth/login')
      .send({ email: 'delegate@example.com', password: 'delegate-pass' })
      .expect(201);
    delegateToken = delegateLogin.body.access_token;
  });

  afterAll(async () => {
    if (app) await app.close();
    if (prisma) await prisma.$disconnect();
  });

  it('refuse l’accès à /members sans JWT', async () => {
    await request(server).get('/members').expect(401);
  });

  it('permet au GM de voir la liste globale des membres (vide au début)', async () => {
    const res = await request(server)
      .get('/members')
      .set('Authorization', `Bearer ${gmToken}`)
      .expect(200);

    const list = Array.isArray(res.body) ? res.body : (res.body.data ?? []);
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBe(0);
  });

  it('permet au délégué de créer un member', async () => {
    const res = await request(server)
      .post('/members')
      .set('Authorization', `Bearer ${delegateToken}`)
      .send({ cin: 'CIN123456', fullName: 'Premier Assuré' })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.cin).toBe('CIN123456');
    expect(res.body.fullName).toBe('Premier Assuré');
    memberId = res.body.id;
  });

  it('permet au délégué de lister uniquement SES members', async () => {
    const res = await request(server)
      .get('/members')
      .set('Authorization', `Bearer ${delegateToken}`)
      .expect(200);

    const list = Array.isArray(res.body) ? res.body : (res.body.data ?? []);
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThanOrEqual(1);
    const first = list.find((m: any) => m.cin === 'CIN123456');
    expect(first).toBeDefined();
  });

  it('permet au GM de voir tous les members (vue globale)', async () => {
    const res = await request(server)
      .get('/members')
      .set('Authorization', `Bearer ${gmToken}`)
      .expect(200);

    const list = Array.isArray(res.body) ? res.body : (res.body.data ?? []);
    expect(Array.isArray(list)).toBe(true);
    const found = list.find((m: any) => m.cin === 'CIN123456');
    expect(found).toBeDefined();
  });

  it('permet au délégué de créer un paiement pour son member', async () => {
    const res = await request(server)
      .post('/payments')
      .set('Authorization', `Bearer ${delegateToken}`)
      .send({ memberId, amount: '100.00' })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.memberId).toBe(memberId);
  });

  it('permet au GM de lister les paiements', async () => {
    const res = await request(server)
      .get('/payments')
      .set('Authorization', `Bearer ${gmToken}`)
      .expect(200);

    const list = Array.isArray(res.body) ? res.body : (res.body.data ?? []);
    expect(Array.isArray(list)).toBe(true);
    const found = list.find((p: any) => p.memberId === memberId);
    expect(found).toBeDefined();
  });
});
