import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma.service'; // Assurez-vous que le chemin est correct

const prismaMock = {
    user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        // Ajoutez les autres méthodes de User que le service pourrait appeler
    },
};

describe('UsersService', () => {
    let service: UsersService;
    let prisma: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                // CORRECTION : Fournir le mock de la dépendance PrismaService
                {
                    provide: PrismaService,
                    useValue: prismaMock,
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        prisma = module.get(PrismaService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});