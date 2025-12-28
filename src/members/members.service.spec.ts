import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { currentRegionIdsForManager } from '../common/region-access.helper';
import { PrismaService } from '../prisma.service';
import { MembersService } from './members.service';

jest.mock('../common/region-access.helper', () => ({
  currentRegionIdsForManager: jest.fn(),
}));

describe('MembersService', () => {
  let service: MembersService;
  let prisma: jest.Mocked<PrismaService>;
  const currentRegionIdsForManagerMock =
    currentRegionIdsForManager as jest.MockedFunction<
      typeof currentRegionIdsForManager
    >;

  const prismaMock = {
    member: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    delegate: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembersService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get(MembersService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
    currentRegionIdsForManagerMock.mockReset();
  });

  describe('create', () => {
    it('crée un membre pour un délégué connecté', async () => {
      prisma.delegate.findFirst.mockResolvedValue({ id: 'del-1' } as any);
      prisma.member.create.mockResolvedValue({ id: 'm1' } as any);

      const dto = { cin: 'CIN123', fullName: 'Ali', status: 'ACTIVE' } as any;
      const user = { role: 'DELEGATE', userId: 'user-1' };

      const result = await service.create(dto, user);

      expect(prisma.delegate.findFirst).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
      expect(prisma.member.create).toHaveBeenCalledWith({
        data: {
          cin: 'CIN123',
          fullName: 'Ali',
          status: 'ACTIVE',
          delegateId: 'del-1',
        },
      });
      expect(result).toEqual({ id: 'm1' });
    });

    it('rejette si le rôle est interdit', async () => {
      const dto = { cin: 'CIN', fullName: 'Ali' } as any;
      await expect(
        service.create(dto, { role: 'USER' }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  it('findAll filtre sur le délégué et les critères de recherche', async () => {
    prisma.delegate.findFirst.mockResolvedValue({ id: 'del-1' } as any);
    prisma.member.findMany.mockResolvedValue([] as any);

    await service.findAll(
      { q: 'ali', status: 'ACTIVE', skip: 0, take: 10 } as any,
      { role: 'DELEGATE', userId: 'user-1' },
    );

    expect(prisma.member.findMany).toHaveBeenCalledWith({
      where: {
        status: 'ACTIVE',
        fullName: { contains: 'ali', mode: 'insensitive' },
        delegateId: 'del-1',
      },
      skip: 0,
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        delegate: {
          include: {
            region: true,
            manager: { include: { user: true, region: true } },
            user: true,
          },
        },
        payments: true,
      },
    });
  });

  it('findOne retourne le membre pour le GM', async () => {
    prisma.member.findFirst.mockResolvedValue({ id: 'm1' } as any);

    const res = await service.findOne('m1', { role: 'GM' });

    expect(prisma.member.findFirst).toHaveBeenCalledWith({
      where: { id: 'm1' },
      include: {
        delegate: {
          include: {
            region: true,
            manager: { include: { user: true, region: true } },
            user: true,
          },
        },
        payments: true,
      },
    });
    expect(res).toEqual({ id: 'm1' });
  });

  it('findOne lève NotFound si le membre est absent', async () => {
    prisma.member.findFirst.mockResolvedValue(null as any);

    await expect(
      service.findOne('missing', { role: 'GM' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('remove supprime le membre après vérification des droits', async () => {
    prisma.member.findFirst.mockResolvedValue({ id: 'm1' } as any);
    prisma.member.delete.mockResolvedValue({ id: 'm1' } as any);

    const res = await service.remove('m1', { role: 'GM' });

    expect(prisma.member.delete).toHaveBeenCalledWith({ where: { id: 'm1' } });
    expect(res).toEqual({ id: 'm1' });
  });
});
