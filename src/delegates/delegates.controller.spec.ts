import { Test, TestingModule } from '@nestjs/testing';
import { DelegatesController } from './delegates.controller';
import { DelegatesService } from './delegates.service';

// Définition d'un MOCK de DelegatesService
const delegatesServiceMock = {
  findAllForUser: jest.fn(),
  create: jest.fn(),
  findOneForUser: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  // Mocker toutes les méthodes que DelegatesController appelle
};

describe('DelegatesController', () => {
  let controller: DelegatesController;
  let service: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DelegatesController],
      providers: [
        // CORRECTION : Injecter directement le mock du service
        {
          provide: DelegatesService,
          useValue: delegatesServiceMock,
        },
        // NOTE: Si le contrôleur a des Guards ou Interceptors,
        // et qu'il échoue encore, cela sera la prochaine étape de correction.
      ],
    }).compile();

    controller = module.get<DelegatesController>(DelegatesController);
    service = module.get(DelegatesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
