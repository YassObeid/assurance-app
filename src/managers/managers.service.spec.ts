import { Test, TestingModule } from '@nestjs/testing';
import { ManagersService } from './managers.service';
import { PrismaService } from '../prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common'; // Import de NotFoundException

// Mock complet du PrismaService
const prismaMock = {
  user: {
    findUnique: jest.fn(),
  },
  region: {
    findUnique: jest.fn(),
  },
  manager: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('ManagersService', () => {
  let service: ManagersService;
  let prisma: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ManagersService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<ManagersService>(ManagersService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  it('create doit refuser si user inexistant', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.region.findUnique.mockResolvedValue({ id: 'r1' });

    await expect(
      service.create({ userId: 'u1', regionId: 'r1' } as any),
    ).rejects.toThrow(NotFoundException); // CORRECTION : Attend NotFoundException
  });

  it('create doit refuser si region inexistante', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      role: 'REGION_MANAGER',
    });
    prisma.region.findUnique.mockResolvedValue(null);

    await expect(
      service.create({ userId: 'u1', regionId: 'r1' } as any),
    ).rejects.toThrow(NotFoundException); // CORRECTION : Attend NotFoundException
  });
});
