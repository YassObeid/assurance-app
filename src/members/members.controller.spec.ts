import { Test, TestingModule } from '@nestjs/testing';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';

// Définition d'un MOCK de MembersService
const membersServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
};

describe('MembersController', () => {
    let controller: MembersController;
    let service: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MembersController],
            providers: [
                // CORRECTION : Injecter directement le mock du service
                {
                    provide: MembersService,
                    useValue: membersServiceMock,
                },
            ],
        }).compile();

        controller = module.get<MembersController>(MembersController);
        service = module.get(MembersService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});