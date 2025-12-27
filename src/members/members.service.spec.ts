import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getActiveManagerIdsForUser } from '../common/auth.helpers';
import { PrismaService } from '../prisma.service';
import { MembersService } from './members.service';
import { RequestUser } from '../common/types/request-user.type';

jest.mock('../common/auth.helpers', () => ({
  getActiveManagerIdsForUser: jest.fn(),
}));

describe('MembersService', () => {
  let service: MembersService;
  let prisma: PrismaService;
  const getActiveManagerIdsForUserMock = getActiveManagerIdsForUser as jest.MockedFunction<
    typeof getActiveManagerIdsForUser
  >;

  const prismaMock = {
    member: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    delegate: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
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

    service = module.get<MembersService>(MembersService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
    getActiveManagerIdsForUserMock.mockReset();
  });

  describe('create', () => {
    const validDto = {
      cin: 'CIN123',
      fullName: 'Ali Hassan',
      status: 'ACTIVE' as const,
    };

    describe('as DELEGATE', () => {
      it('should create member with delegateId from token', async () => {
        const user: RequestUser = {
          userId: 'user-1',
          role: 'DELEGATE',
          delegateId: 'del-1',
        };

        prismaMock.member.create.mockResolvedValue({
          id: 'm1',
          ...validDto,
          delegateId: 'del-1',
        } as any);

        const result = await service.create(validDto, user);

        expect(prismaMock.member.create).toHaveBeenCalledWith({
          data: {
            cin: validDto.cin,
            fullName: validDto.fullName,
            status: validDto.status,
            delegateId: 'del-1',
          },
        });
        expect(result).toEqual({
          id: 'm1',
          ...validDto,
          delegateId: 'del-1',
        });
      });

      it('should throw BadRequestException if delegateId is missing in token', async () => {
        const user: RequestUser = {
          userId: 'user-1',
          role: 'DELEGATE',
        };

        await expect(service.create(validDto, user)).rejects.toThrow(
          BadRequestException,
        );
        await expect(service.create(validDto, user)).rejects.toThrow(
          'Aucun délégué associé à cet utilisateur',
        );
        expect(prismaMock.member.create).not.toHaveBeenCalled();
      });
    });

    describe('as GM', () => {
      it('should create member with delegateId from DTO', async () => {
        const dtoWithDelegateId = { ...validDto, delegateId: 'del-2' };
        const user: RequestUser = {
          userId: 'admin-1',
          role: 'GM',
        };

        prismaMock.delegate.findUnique.mockResolvedValue({
          id: 'del-2',
        } as any);
        prismaMock.member.create.mockResolvedValue({
          id: 'm2',
          ...validDto,
          delegateId: 'del-2',
        } as any);

        const result = await service.create(dtoWithDelegateId, user);

        expect(prismaMock.delegate.findUnique).toHaveBeenCalledWith({
          where: { id: 'del-2' },
        });
        expect(prismaMock.member.create).toHaveBeenCalledWith({
          data: {
            cin: validDto.cin,
            fullName: validDto.fullName,
            status: validDto.status,
            delegateId: 'del-2',
          },
        });
        expect(result.id).toBe('m2');
      });

      it('should throw BadRequestException if delegateId is missing in DTO', async () => {
        const user: RequestUser = {
          userId: 'admin-1',
          role: 'GM',
        };

        await expect(service.create(validDto, user)).rejects.toThrow(
          BadRequestException,
        );
        await expect(service.create(validDto, user)).rejects.toThrow(
          'Le delegateId est requis pour le GM',
        );
        expect(prismaMock.member.create).not.toHaveBeenCalled();
      });

      it('should throw BadRequestException if delegate does not exist', async () => {
        const dtoWithDelegateId = { ...validDto, delegateId: 'invalid-del' };
        const user: RequestUser = {
          userId: 'admin-1',
          role: 'GM',
        };

        prismaMock.delegate.findUnique.mockResolvedValue(null);

        await expect(
          service.create(dtoWithDelegateId, user),
        ).rejects.toThrow(BadRequestException);
        await expect(
          service.create(dtoWithDelegateId, user),
        ).rejects.toThrow('Délégué introuvable');
        expect(prismaMock.member.create).not.toHaveBeenCalled();
      });
    });

    describe('validation errors', () => {
      it('should throw ForbiddenException for REGION_MANAGER role', async () => {
        const user: RequestUser = {
          userId: 'manager-1',
          role: 'REGION_MANAGER',
          managerRegionIds: ['region-1'],
        };

        await expect(service.create(validDto, user)).rejects.toThrow(
          ForbiddenException,
        );
        await expect(service.create(validDto, user)).rejects.toThrow(
          'Seul un délégué ou le GM peut créer un membre',
        );
      });

      it('should throw ForbiddenException for invalid role', async () => {
        const user = { userId: 'user-1', role: 'INVALID_ROLE' } as any;

        await expect(service.create(validDto, user)).rejects.toThrow(
          ForbiddenException,
        );
      });
    });
  });

  describe('findAll', () => {
    const mockMembers = [
      { id: 'm1', cin: 'CIN1', fullName: 'Member 1' },
      { id: 'm2', cin: 'CIN2', fullName: 'Member 2' },
    ];

    describe('as GM', () => {
      it('should return all members with pagination', async () => {
        const user: RequestUser = { userId: 'admin', role: 'GM' };
        const query = { page: 1, limit: 10 };

        prismaMock.member.count.mockResolvedValue(2);
        prismaMock.member.findMany.mockResolvedValue(mockMembers as any);

        const result = await service.findAll(query, user);

        expect(prismaMock.member.count).toHaveBeenCalledWith({
          where: {},
        });
        expect(prismaMock.member.findMany).toHaveBeenCalledWith({
          where: {},
          skip: 0,
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: expect.any(Object),
        });
        expect(result.data).toEqual(mockMembers);
        expect(result.meta.total).toBe(2);
        expect(result.meta.page).toBe(1);
      });

      it('should filter by status and search query', async () => {
        const user: RequestUser = { userId: 'admin', role: 'GM' };
        const query = { page: 1, limit: 10, status: 'ACTIVE' as const, q: 'Ali' };

        prismaMock.member.count.mockResolvedValue(1);
        prismaMock.member.findMany.mockResolvedValue([mockMembers[0]] as any);

        const result = await service.findAll(query, user);

        expect(prismaMock.member.count).toHaveBeenCalledWith({
          where: {
            status: 'ACTIVE',
            OR: [
              { fullName: { contains: 'Ali', mode: 'insensitive' } },
              { cin: { contains: 'Ali', mode: 'insensitive' } },
            ],
          },
        });
        expect(result.data.length).toBe(1);
      });
    });

    describe('as DELEGATE', () => {
      it('should return only delegate own members', async () => {
        const user: RequestUser = {
          userId: 'user-1',
          role: 'DELEGATE',
          delegateId: 'del-1',
        };
        const query = { page: 1, limit: 10 };

        prismaMock.member.count.mockResolvedValue(2);
        prismaMock.member.findMany.mockResolvedValue(mockMembers as any);

        const result = await service.findAll(query, user);

        expect(prismaMock.member.count).toHaveBeenCalledWith({
          where: { delegateId: 'del-1' },
        });
        expect(prismaMock.member.findMany).toHaveBeenCalledWith({
          where: { delegateId: 'del-1' },
          skip: 0,
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: expect.any(Object),
        });
      });

      it('should return empty if delegateId is missing', async () => {
        const user: RequestUser = {
          userId: 'user-1',
          role: 'DELEGATE',
        };
        const query = { page: 1, limit: 10 };

        const result = await service.findAll(query, user);

        expect(result.data).toEqual([]);
        expect(result.meta.total).toBe(0);
        expect(prismaMock.member.findMany).not.toHaveBeenCalled();
      });
    });

    describe('as REGION_MANAGER', () => {
      it('should return members from manager active regions', async () => {
        const user: RequestUser = {
          userId: 'manager-1',
          role: 'REGION_MANAGER',
          managerRegionIds: ['region-1'],
        };
        const query = { page: 1, limit: 10 };

        getActiveManagerIdsForUserMock.mockResolvedValue(['mgr-1', 'mgr-2']);
        prismaMock.member.count.mockResolvedValue(2);
        prismaMock.member.findMany.mockResolvedValue(mockMembers as any);

        const result = await service.findAll(query, user);

        expect(getActiveManagerIdsForUserMock).toHaveBeenCalledWith(
          prisma,
          'manager-1',
        );
        expect(prismaMock.member.count).toHaveBeenCalledWith({
          where: {
            delegate: {
              deletedAt: null,
              managerId: { in: ['mgr-1', 'mgr-2'] },
            },
          },
        });
      });

      it('should return empty if manager has no active assignments', async () => {
        const user: RequestUser = {
          userId: 'manager-1',
          role: 'REGION_MANAGER',
        };
        const query = { page: 1, limit: 10 };

        getActiveManagerIdsForUserMock.mockResolvedValue([]);

        const result = await service.findAll(query, user);

        expect(result.data).toEqual([]);
        expect(result.meta.total).toBe(0);
        expect(prismaMock.member.findMany).not.toHaveBeenCalled();
      });
    });

    it('should throw ForbiddenException for invalid role', async () => {
      const user = { userId: 'user-1', role: 'INVALID_ROLE' } as any;

      await expect(service.findAll({}, user)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findOne', () => {
    const mockMember = {
      id: 'm1',
      cin: 'CIN123',
      fullName: 'Ali Hassan',
      delegateId: 'del-1',
    };

    describe('as GM', () => {
      it('should return member by id', async () => {
        const user: RequestUser = { userId: 'admin', role: 'GM' };

        prismaMock.member.findFirst.mockResolvedValue(mockMember as any);

        const result = await service.findOne('m1', user);

        expect(prismaMock.member.findFirst).toHaveBeenCalledWith({
          where: { id: 'm1' },
          include: expect.any(Object),
        });
        expect(result).toEqual(mockMember);
      });
    });

    describe('as DELEGATE', () => {
      it('should return member if owned by delegate', async () => {
        const user: RequestUser = {
          userId: 'user-1',
          role: 'DELEGATE',
          delegateId: 'del-1',
        };

        prismaMock.member.findFirst.mockResolvedValue(mockMember as any);

        const result = await service.findOne('m1', user);

        expect(prismaMock.member.findFirst).toHaveBeenCalledWith({
          where: { id: 'm1', delegateId: 'del-1' },
          include: expect.any(Object),
        });
        expect(result).toEqual(mockMember);
      });

      it('should throw ForbiddenException if delegateId is missing', async () => {
        const user: RequestUser = {
          userId: 'user-1',
          role: 'DELEGATE',
        };

        await expect(service.findOne('m1', user)).rejects.toThrow(
          ForbiddenException,
        );
        await expect(service.findOne('m1', user)).rejects.toThrow(
          'Accès refusé',
        );
      });

      it('should throw NotFoundException if member not owned by delegate', async () => {
        const user: RequestUser = {
          userId: 'user-1',
          role: 'DELEGATE',
          delegateId: 'del-1',
        };

        prismaMock.member.findFirst.mockResolvedValue(null);

        await expect(service.findOne('m1', user)).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('as REGION_MANAGER', () => {
      it('should return member from manager regions', async () => {
        const user: RequestUser = {
          userId: 'manager-1',
          role: 'REGION_MANAGER',
        };

        getActiveManagerIdsForUserMock.mockResolvedValue(['mgr-1']);
        prismaMock.member.findFirst.mockResolvedValue(mockMember as any);

        const result = await service.findOne('m1', user);

        expect(prismaMock.member.findFirst).toHaveBeenCalledWith({
          where: {
            id: 'm1',
            delegate: {
              deletedAt: null,
              managerId: { in: ['mgr-1'] },
            },
          },
          include: expect.any(Object),
        });
        expect(result).toEqual(mockMember);
      });
    });

    it('should throw NotFoundException if member does not exist', async () => {
      const user: RequestUser = { userId: 'admin', role: 'GM' };

      prismaMock.member.findFirst.mockResolvedValue(null);

      await expect(service.findOne('missing', user)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('missing', user)).rejects.toThrow(
        'Membre introuvable',
      );
    });

    it('should throw ForbiddenException for invalid role', async () => {
      const user = { userId: 'user-1', role: 'INVALID_ROLE' } as any;

      await expect(service.findOne('m1', user)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    const mockMember = {
      id: 'm1',
      cin: 'CIN123',
      fullName: 'Ali Hassan',
    };

    describe('successful updates', () => {
      it('should update member fields', async () => {
        const user: RequestUser = { userId: 'admin', role: 'GM' };
        const updateDto = {
          cin: 'CIN456',
          fullName: 'Hassan Ali',
          status: 'SUSPENDED' as const,
        };

        prismaMock.member.findFirst.mockResolvedValue(mockMember as any);
        prismaMock.member.update.mockResolvedValue({
          ...mockMember,
          ...updateDto,
        } as any);

        const result = await service.update('m1', updateDto, user);

        expect(prismaMock.member.update).toHaveBeenCalledWith({
          where: { id: 'm1' },
          data: updateDto,
        });
        expect(result.cin).toBe('CIN456');
        expect(result.fullName).toBe('Hassan Ali');
        expect(result.status).toBe('SUSPENDED');
      });

      it('should update only provided fields', async () => {
        const user: RequestUser = { userId: 'admin', role: 'GM' };
        const updateDto = { fullName: 'New Name' };

        prismaMock.member.findFirst.mockResolvedValue(mockMember as any);
        prismaMock.member.update.mockResolvedValue({
          ...mockMember,
          fullName: 'New Name',
        } as any);

        const result = await service.update('m1', updateDto, user);

        expect(prismaMock.member.update).toHaveBeenCalledWith({
          where: { id: 'm1' },
          data: { fullName: 'New Name' },
        });
        expect(result.fullName).toBe('New Name');
      });

      it('should verify ownership before update', async () => {
        const user: RequestUser = {
          userId: 'user-1',
          role: 'DELEGATE',
          delegateId: 'del-1',
        };
        const updateDto = { fullName: 'Updated Name' };

        prismaMock.member.findFirst.mockResolvedValue(mockMember as any);
        prismaMock.member.update.mockResolvedValue({
          ...mockMember,
          ...updateDto,
        } as any);

        await service.update('m1', updateDto, user);

        // Should call findOne first to verify ownership
        expect(prismaMock.member.findFirst).toHaveBeenCalledWith({
          where: { id: 'm1', delegateId: 'del-1' },
          include: expect.any(Object),
        });
      });
    });

    it('should throw NotFoundException if member does not exist', async () => {
      const user: RequestUser = { userId: 'admin', role: 'GM' };
      const updateDto = { fullName: 'New Name' };

      prismaMock.member.findFirst.mockResolvedValue(null);

      await expect(
        service.update('missing', updateDto, user),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error if delegate tries to update member they do not own', async () => {
      const user: RequestUser = {
        userId: 'user-1',
        role: 'DELEGATE',
        delegateId: 'del-1',
      };
      const updateDto = { fullName: 'New Name' };

      prismaMock.member.findFirst.mockResolvedValue(null);

      await expect(service.update('m1', updateDto, user)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    const mockMember = {
      id: 'm1',
      cin: 'CIN123',
      fullName: 'Ali Hassan',
    };

    describe('as GM', () => {
      it('should delete member', async () => {
        const user: RequestUser = { userId: 'admin', role: 'GM' };

        prismaMock.member.findFirst.mockResolvedValue(mockMember as any);
        prismaMock.member.delete.mockResolvedValue(mockMember as any);

        const result = await service.remove('m1', user);

        expect(prismaMock.member.findFirst).toHaveBeenCalledWith({
          where: { id: 'm1' },
          include: expect.any(Object),
        });
        expect(prismaMock.member.delete).toHaveBeenCalledWith({
          where: { id: 'm1' },
        });
        expect(result).toEqual(mockMember);
      });
    });

    describe('as REGION_MANAGER', () => {
      it('should delete member from their region', async () => {
        const user: RequestUser = {
          userId: 'manager-1',
          role: 'REGION_MANAGER',
        };

        getActiveManagerIdsForUserMock.mockResolvedValue(['mgr-1']);
        prismaMock.member.findFirst.mockResolvedValue(mockMember as any);
        prismaMock.member.delete.mockResolvedValue(mockMember as any);

        const result = await service.remove('m1', user);

        expect(prismaMock.member.delete).toHaveBeenCalled();
        expect(result).toEqual(mockMember);
      });
    });

    describe('as DELEGATE', () => {
      it('should throw ForbiddenException', async () => {
        const user: RequestUser = {
          userId: 'user-1',
          role: 'DELEGATE',
          delegateId: 'del-1',
        };

        await expect(service.remove('m1', user)).rejects.toThrow(
          ForbiddenException,
        );
        await expect(service.remove('m1', user)).rejects.toThrow(
          'Les délégués ne peuvent pas supprimer de membres',
        );
        expect(prismaMock.member.delete).not.toHaveBeenCalled();
      });
    });

    it('should throw NotFoundException if member does not exist', async () => {
      const user: RequestUser = { userId: 'admin', role: 'GM' };

      prismaMock.member.findFirst.mockResolvedValue(null);

      await expect(service.remove('missing', user)).rejects.toThrow(
        NotFoundException,
      );
      expect(prismaMock.member.delete).not.toHaveBeenCalled();
    });

    it('should verify ownership before deletion', async () => {
      const user: RequestUser = {
        userId: 'manager-1',
        role: 'REGION_MANAGER',
      };

      getActiveManagerIdsForUserMock.mockResolvedValue(['mgr-1']);
      prismaMock.member.findFirst.mockResolvedValue(mockMember as any);
      prismaMock.member.delete.mockResolvedValue(mockMember as any);

      await service.remove('m1', user);

      // Should call findOne first
      expect(prismaMock.member.findFirst).toHaveBeenCalled();
    });
  });
});
