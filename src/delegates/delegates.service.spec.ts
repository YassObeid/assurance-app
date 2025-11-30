import { Test, TestingModule } from '@nestjs/testing';
import { DelegatesService } from './delegates.service';
import { PrismaService } from '../prisma.service';

describe('DelegatesService', () => {
  let service: DelegatesService;
  // changed code
  let prisma: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DelegatesService,
        {
          provide: PrismaService,
          useValue: {
            delegate: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get(DelegatesService);
    // changed code - juste récupère le mock directement, sans cast 'as any'
    prisma = module.get(PrismaService);
  });

  it('create doit appeler prisma.delegate.create avec les bons champs', async () => {
    prisma.delegate.create.mockResolvedValue({ id: 'd1' });

    const dto: any = {
      name: 'Ali',
      phone: '0123456789',
      regionId: 'r1',
      managerId: 'm1',
      userId: 'u1',
    };

    const res = await service.create(dto);

    expect(prisma.delegate.create).toHaveBeenCalledWith({
      data: {
        name: 'Ali',
        phone: '0123456789',
        regionId: 'r1',
        managerId: 'm1',
        userId: 'u1',
      },
      include: {
        region: true,
        manager: { include: { user: true, region: true } },
        user: true,
      },
    });
    expect(res).toEqual({ id: 'd1' });
  });

  it('findAll doit appeler prisma.delegate.findMany avec include & orderBy', async () => {
    prisma.delegate.findMany.mockResolvedValue([]);

    await service.findAll();

    expect(prisma.delegate.findMany).toHaveBeenCalledWith({
      include: {
        region: true,
        manager: { include: { user: true, region: true } },
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  });
});