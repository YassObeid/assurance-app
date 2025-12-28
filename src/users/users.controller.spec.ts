import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

// Définition d'un MOCK de UsersService
const usersServiceMock = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  // Mocker toutes les méthodes que UsersController appelle
};

describe('UsersController', () => {
  let controller: UsersController;
  let service: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        // CORRECTION : Injecter directement le mock du service
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
        // Si le contrôleur a des Guards (e.g. JwtAuthGuard), ils doivent être mockés ici
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
