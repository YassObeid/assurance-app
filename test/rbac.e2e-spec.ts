import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const request = require('supertest');

describe('RBAC Authorization E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let server: any;

  // Tokens
  let gmToken: string;
  let managerToken: string;
  let delegate1Token: string;
  let delegate2Token: string;

  // IDs
  let regionBeyrouthId: string;
  let regionNordId: string;
  let managerBeyrouthId: string;
  let delegate1Id: string; // Beyrouth
  let delegate2Id: string; // Nord
  let member1Id: string; // Belongs to delegate1
  let member2Id: string; // Belongs to delegate2

  beforeAll(async () => {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });

    await prisma.$connect();

    // Clean database in correct order (respect FK constraints)
    await prisma.payment.deleteMany();
    await prisma.member.deleteMany();
    await prisma.delegate.deleteMany();
    await prisma.regionManager.deleteMany();
    await prisma.region.deleteMany();
    await prisma.user.deleteMany();

    // Create users
    const gmUser = await prisma.user.create({
      data: {
        name: 'GM User',
        email: 'gm-rbac@example.com',
        password: await bcrypt.hash('test123', 10),
        role: Role.GM,
      },
    });

    const managerUser = await prisma.user.create({
      data: {
        name: 'Manager Beyrouth',
        email: 'manager-rbac@example.com',
        password: await bcrypt.hash('test123', 10),
        role: Role.REGION_MANAGER,
      },
    });

    const delegate1User = await prisma.user.create({
      data: {
        name: 'Delegate 1',
        email: 'delegate1-rbac@example.com',
        password: await bcrypt.hash('test123', 10),
        role: Role.DELEGATE,
      },
    });

    const delegate2User = await prisma.user.create({
      data: {
        name: 'Delegate 2',
        email: 'delegate2-rbac@example.com',
        password: await bcrypt.hash('test123', 10),
        role: Role.DELEGATE,
      },
    });

    // Create regions
    const regionBeyrouth = await prisma.region.create({
      data: { name: 'Beyrouth RBAC' },
    });
    regionBeyrouthId = regionBeyrouth.id;

    const regionNord = await prisma.region.create({
      data: { name: 'Nord RBAC' },
    });
    regionNordId = regionNord.id;

    // Create manager assignment (Beyrouth only)
    const managerAssignment = await prisma.regionManager.create({
      data: {
        userId: managerUser.id,
        regionId: regionBeyrouthId,
        // endAt: null (active)
      },
    });
    managerBeyrouthId = managerAssignment.id;

    // Create delegates
    const delegate1 = await prisma.delegate.create({
      data: {
        name: 'Delegate Beyrouth',
        regionId: regionBeyrouthId,
        managerId: managerBeyrouthId,
        userId: delegate1User.id,
      },
    });
    delegate1Id = delegate1.id;

    // Create a manager for Nord region (without user for this test)
    const managerNord = await prisma.regionManager.create({
      data: {
        userId: gmUser.id, // Just for FK constraint
        regionId: regionNordId,
      },
    });

    const delegate2 = await prisma.delegate.create({
      data: {
        name: 'Delegate Nord',
        regionId: regionNordId,
        managerId: managerNord.id,
        userId: delegate2User.id,
      },
    });
    delegate2Id = delegate2.id;

    // Create members
    const member1 = await prisma.member.create({
      data: {
        cin: 'CIN-D1-001',
        fullName: 'Member of Delegate 1',
        delegateId: delegate1Id,
      },
    });
    member1Id = member1.id;

    const member2 = await prisma.member.create({
      data: {
        cin: 'CIN-D2-001',
        fullName: 'Member of Delegate 2',
        delegateId: delegate2Id,
      },
    });
    member2Id = member2.id;

    // Initialize app
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

    // Get tokens
    const gmLogin = await request(server)
      .post('/auth/login')
      .send({ email: 'gm-rbac@example.com', password: 'test123' });
    gmToken = gmLogin.body.access_token;

    const managerLogin = await request(server)
      .post('/auth/login')
      .send({ email: 'manager-rbac@example.com', password: 'test123' });
    managerToken = managerLogin.body.access_token;

    const delegate1Login = await request(server)
      .post('/auth/login')
      .send({ email: 'delegate1-rbac@example.com', password: 'test123' });
    delegate1Token = delegate1Login.body.access_token;

    const delegate2Login = await request(server)
      .post('/auth/login')
      .send({ email: 'delegate2-rbac@example.com', password: 'test123' });
    delegate2Token = delegate2Login.body.access_token;
  });

  afterAll(async () => {
    if (app) await app.close();
    if (prisma) await prisma.$disconnect();
  });

  describe('Delegates Access Control', () => {
    it('GM can view all delegates', async () => {
      const res = await request(server)
        .get('/delegates')
        .set('Authorization', `Bearer ${gmToken}`)
        .expect(200);

      const list = Array.isArray(res.body) ? res.body : res.body.data ?? [];
      expect(list.length).toBeGreaterThanOrEqual(2);
    });

    it('REGION_MANAGER can only view delegates in their region', async () => {
      const res = await request(server)
        .get('/delegates')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      const list = Array.isArray(res.body) ? res.body : res.body.data ?? [];
      // Should only see delegate1 (Beyrouth), not delegate2 (Nord)
      expect(list.length).toBe(1);
      expect(list[0].id).toBe(delegate1Id);
    });

    it('DELEGATE cannot access /delegates endpoint', async () => {
      await request(server)
        .get('/delegates')
        .set('Authorization', `Bearer ${delegate1Token}`)
        .expect(403); // Forbidden
    });

    it('DELEGATE cannot access /delegates/:id endpoint', async () => {
      await request(server)
        .get(`/delegates/${delegate1Id}`)
        .set('Authorization', `Bearer ${delegate1Token}`)
        .expect(403); // Forbidden
    });
  });

  describe('Members Access Control', () => {
    it('DELEGATE can only view their own members', async () => {
      const res = await request(server)
        .get('/members')
        .set('Authorization', `Bearer ${delegate1Token}`)
        .expect(200);

      const list = Array.isArray(res.body) ? res.body : res.body.data ?? [];
      expect(list.length).toBe(1);
      expect(list[0].cin).toBe('CIN-D1-001');
    });

    it('DELEGATE cannot view other delegates\' members', async () => {
      const res = await request(server)
        .get(`/members/${member2Id}`)
        .set('Authorization', `Bearer ${delegate1Token}`)
        .expect(404); // Not found (filtered out)
    });

    it('REGION_MANAGER can view members from their region', async () => {
      const res = await request(server)
        .get('/members')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      const list = Array.isArray(res.body) ? res.body : res.body.data ?? [];
      // Should only see member1 (Beyrouth), not member2 (Nord)
      expect(list.length).toBe(1);
      expect(list[0].cin).toBe('CIN-D1-001');
    });

    it('GM can view all members', async () => {
      const res = await request(server)
        .get('/members')
        .set('Authorization', `Bearer ${gmToken}`)
        .expect(200);

      const list = Array.isArray(res.body) ? res.body : res.body.data ?? [];
      expect(list.length).toBeGreaterThanOrEqual(2);
    });

    it('DELEGATE can create members (delegateId auto-assigned)', async () => {
      const res = await request(server)
        .post('/members')
        .set('Authorization', `Bearer ${delegate1Token}`)
        .send({ cin: 'CIN-NEW', fullName: 'New Member' })
        .expect(201);

      expect(res.body.delegateId).toBe(delegate1Id);
    });

    it('DELEGATE cannot delete members', async () => {
      await request(server)
        .delete(`/members/${member1Id}`)
        .set('Authorization', `Bearer ${delegate1Token}`)
        .expect(403); // Forbidden
    });

    it('REGION_MANAGER can delete members in their region', async () => {
      // Create a test member first
      const testMember = await prisma.member.create({
        data: {
          cin: 'CIN-DELETE-TEST',
          fullName: 'Delete Test',
          delegateId: delegate1Id,
        },
      });

      await request(server)
        .delete(`/members/${testMember.id}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);
    });
  });

  describe('Payments Access Control', () => {
    it('DELEGATE can create payments for their own members', async () => {
      const res = await request(server)
        .post('/payments')
        .set('Authorization', `Bearer ${delegate1Token}`)
        .send({ memberId: member1Id, amount: '50.00' })
        .expect(201);

      expect(res.body.memberId).toBe(member1Id);
      expect(res.body.delegateId).toBe(delegate1Id);
    });

    it('DELEGATE cannot create payments for other delegates\' members', async () => {
      await request(server)
        .post('/payments')
        .set('Authorization', `Bearer ${delegate1Token}`)
        .send({ memberId: member2Id, amount: '50.00' })
        .expect(403); // Forbidden - member doesn't belong to this delegate
    });

    it('DELETE payment endpoint is removed (audit trail)', async () => {
      // Try to delete - endpoint should not exist
      const payment = await prisma.payment.create({
        data: {
          memberId: member1Id,
          amount: '100.00',
          delegateId: delegate1Id,
        },
      });

      await request(server)
        .delete(`/payments/${payment.id}`)
        .set('Authorization', `Bearer ${gmToken}`)
        .expect(404); // Not Found - endpoint doesn't exist
    });
  });

  describe('Pagination Tests', () => {
    it('Pagination works on /members endpoint', async () => {
      const res = await request(server)
        .get('/members?page=1&limit=10')
        .set('Authorization', `Bearer ${gmToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('meta');
      expect(res.body.meta).toHaveProperty('page');
      expect(res.body.meta).toHaveProperty('limit');
      expect(res.body.meta).toHaveProperty('total');
    });

    it('Pagination works on /delegates endpoint', async () => {
      const res = await request(server)
        .get('/delegates?page=1&limit=10')
        .set('Authorization', `Bearer ${gmToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('meta');
    });

    it('Pagination works on /payments endpoint', async () => {
      const res = await request(server)
        .get('/payments?page=1&limit=10')
        .set('Authorization', `Bearer ${gmToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('meta');
    });
  });

  describe('Refresh Token Tests', () => {
    it('POST /auth/refresh returns new tokens', async () => {
      const loginRes = await request(server)
        .post('/auth/login')
        .send({ email: 'gm-rbac@example.com', password: 'test123' })
        .expect(201);

      expect(loginRes.body).toHaveProperty('access_token');
      expect(loginRes.body).toHaveProperty('refresh_token');

      const refreshRes = await request(server)
        .post('/auth/refresh')
        .send({ refresh_token: loginRes.body.refresh_token })
        .expect(201);

      expect(refreshRes.body).toHaveProperty('access_token');
      expect(refreshRes.body).toHaveProperty('refresh_token');
      expect(refreshRes.body.access_token).not.toBe(loginRes.body.access_token);
    });

    it('POST /auth/refresh rejects invalid tokens', async () => {
      await request(server)
        .post('/auth/refresh')
        .send({ refresh_token: 'invalid-token' })
        .expect(401);
    });
  });

  describe('Update DTOs Tests', () => {
    it('PATCH /members/:id accepts UpdateMemberDto', async () => {
      const res = await request(server)
        .patch(`/members/${member1Id}`)
        .set('Authorization', `Bearer ${delegate1Token}`)
        .send({ fullName: 'Updated Name', status: 'ACTIVE' })
        .expect(200);

      expect(res.body.fullName).toBe('Updated Name');
    });

    it('PATCH /delegates/:id accepts UpdateDelegateDto (GM only)', async () => {
      const res = await request(server)
        .patch(`/delegates/${delegate1Id}`)
        .set('Authorization', `Bearer ${gmToken}`)
        .send({ name: 'Updated Delegate Name' })
        .expect(200);

      expect(res.body.name).toBe('Updated Delegate Name');
    });

    it('DELEGATE cannot update delegates', async () => {
      await request(server)
        .patch(`/delegates/${delegate1Id}`)
        .set('Authorization', `Bearer ${delegate1Token}`)
        .send({ name: 'Hacked Name' })
        .expect(403);
    });
  });
});
