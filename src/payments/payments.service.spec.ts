import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma.service'; // Import manquant

const prismaMock = {
    payment: {
        findUnique: jest.fn(),
        create: jest.fn(),
    },
    // Ajoutez d'autres tables si PaymentsService les utilise
};

describe('PaymentsService', () => {
    let service: PaymentsService;
    let prisma: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PaymentsService,
                // CORRECTION : Fournir le mock de la dépendance PrismaService
                {
                    provide: PrismaService,
                    useValue: prismaMock,
                },
            ],
        }).compile();

        service = module.get<PaymentsService>(PaymentsService);
        prisma = module.get(PrismaService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});