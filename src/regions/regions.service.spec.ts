import { Test, TestingModule } from '@nestjs/testing';
import { RegionsService } from './regions.service';
import { PrismaService } from '../prisma.service';
import { BadRequestException } from '@nestjs/common';

// changed code - Create explicit mock with jest.fn()
const prismaMock = {
  region: {
    findUnique: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
  },
};

describe('RegionsService', () => {
  let service: RegionsService;
  let prisma: typeof prismaMock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegionsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<RegionsService>(RegionsService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  it('create doit refuser une région déjà existante', async () => {
    prisma.region.findUnique.mockResolvedValue({
      id: 'r1',
      name: 'Beyrouth',
    } as any);

    // changed code - toThrow() without arguments, or use specific error message
    await expect(service.create({ name: 'Beyrouth' })).rejects.toThrow(
      BadRequestException,
    );
  });

  it("create doit créer une nouvelle région si elle n'existe pas", async () => {
    prisma.region.findUnique.mockResolvedValue(null);
    prisma.region.create.mockResolvedValue({
      id: 'r2',
      name: 'Tripoli',
    } as any);

    const res = await service.create({ name: 'Tripoli' });

    expect(prisma.region.create).toHaveBeenCalledWith({
      data: { name: 'Tripoli' },
    });
    expect(res).toEqual({ id: 'r2', name: 'Tripoli' });
  });
  // changed code - Added closing brace
});
