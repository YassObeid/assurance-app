import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

jest.mock('../common/user.helpers', () => ({
  comparePassword: jest.fn(),
}));
import { comparePassword } from '../common/user.helpers';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    usersService = module.get(UsersService) as any;
    jwtService = module.get(JwtService) as any;
  });

  // changed code - Groupe 1 : tests validateUser (email + password)
  describe('validateUser', () => {
    it('doit lever Unauthorized si user introuvable', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.validateUser('unknown@example.com', 'pass'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('doit lever Unauthorized si mot de passe incorrect', async () => {
      usersService.findByEmail.mockResolvedValue({
        id: 'u1',
        email: 'test@example.com',
        password: 'hashed',
        name: 'Test',
        role: 'DELEGATE',
        deletedAt: null,
      } as any);
      (comparePassword as jest.Mock).mockResolvedValue(false);

      await expect(
        service.validateUser('test@example.com', 'wrong'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('doit retourner user validé', async () => {
      usersService.findByEmail.mockResolvedValue({
        id: 'u1',
        email: 'test@example.com',
        password: 'hashed',
        name: 'Test',
        role: 'DELEGATE',
        deletedAt: null,
      } as any);
      (comparePassword as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'good');

      expect(result).toEqual({
        id: 'u1',
        email: 'test@example.com',
        name: 'Test',
        role: 'DELEGATE',
      });
    });
  });

  // changed code - Groupe 2 : tests login (user object)
  describe('login', () => {
    it('doit retourner un token et les infos user', async () => {
      jwtService.signAsync.mockResolvedValue('JWT_TOKEN');

      const result = await service.login({
        id: 'u1',
        email: 'test@example.com',
        name: 'Test',
        role: 'DELEGATE' as const,
      });

      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: 'u1',
        email: 'test@example.com',
        role: 'DELEGATE',
      });
      expect(result).toEqual({
        access_token: 'JWT_TOKEN',
        user: {
          id: 'u1',
          name: 'Test',
          email: 'test@example.com',
          role: 'DELEGATE',
        },
      });
    });
  });
});