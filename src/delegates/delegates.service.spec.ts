import { Test, TestingModule } from '@nestjs/testing';
import { DelegatesService } from './delegates.service';
import { PrismaService } from '../prisma.service';
import { CreateDelegateDto } from '../delegates/dto/create-delegate.dto';
import { BadRequestException } from '@nestjs/common';

const REGION_ID = 'r1';
const MANAGER_ID = 'm1';
const USER_ID = 'u1';
const GM_USER = { userId: 'gm-user-id', role: 'GM' }; // Utilisateur fictif pour le test findAll

const DELEGATE_MOCK: CreateDelegateDto = {
  name: 'Ali',
  phone: '0123456789',
  regionId: REGION_ID,
  managerId: MANAGER_ID,
  userId: USER_ID,
} as any;

// Mock complet du PrismaService
const prismaMock = {
  delegate: {
    create: jest.fn().mockResolvedValue({ id: 'd1', ...DELEGATE_MOCK }),
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue({ id: 'd1', ...DELEGATE_MOCK }),
    update: jest.fn(),
    delete: jest.fn(),
  },
  region: {
    findUnique: jest.fn().mockResolvedValue({ id: REGION_ID }),
  },
  user: {
    findUnique: jest.fn().mockResolvedValue({ id: USER_ID, role: 'DELEGATE' }),
  },
  // Mock pour regionManager (nécessaire pour la validation dans 'create')
  regionManager: {
    findUnique: jest.fn().mockResolvedValue({
      id: MANAGER_ID,
      regionId: REGION_ID,
    }),
  },
};

describe('DelegatesService', () => {
  let service: DelegatesService;
  let prisma: any;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Réinitialiser la valeur par défaut pour le succès du test 'create'
    prismaMock.regionManager.findUnique.mockResolvedValue({
      id: MANAGER_ID,
      regionId: REGION_ID,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DelegatesService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<DelegatesService>(DelegatesService);
    prisma = module.get(PrismaService);
  });

  // Test 'create' (réussit)
  it('create doit appeler prisma.delegate.create avec les bons champs', async () => {
    const dto: any = DELEGATE_MOCK;
    await service.create(dto);

    expect(prisma.delegate.create).toHaveBeenCalledWith({
      data: {
        name: dto.name,
        phone: dto.phone,
        regionId: dto.regionId,
        managerId: dto.managerId,
        userId: dto.userId,
      },
      include: {
        region: true,
        manager: { include: { user: true, region: true } },
        user: true,
      },
    });
  });

  // Test de la validation (réussit)
  it('create doit jeter une BadRequestException si le manager est affecté à une autre région', async () => {
    // Simuler l'échec de la validation en changeant le regionId du manager mocké
    prisma.regionManager.findUnique.mockResolvedValue({
      id: MANAGER_ID,
      regionId: 'AUTRE_REGION',
    });

    const dto: any = DELEGATE_MOCK;

    await expect(service.create(dto)).rejects.toThrow(
      new BadRequestException("Ce manager n'est pas affecté à cette région"),
    );
  });

  // Test 'findAll' CORRIGÉ EN UTILISANT findAllForUser (le nom réel de la méthode de liste)
  it('findAll doit appeler prisma.delegate.findMany avec include & orderBy', async () => {
    // La méthode est findAllForUser(user), donc on la passe l'utilisateur 'GM'
    // pour déclencher le chemin de code qui appelle findMany sans clause 'where'.
    await service.findAllForUser(GM_USER);

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
