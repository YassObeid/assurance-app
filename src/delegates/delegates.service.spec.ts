import { Test, TestingModule } from '@nestjs/testing';
import { DelegatesService } from './delegates.service';

describe('DelegatesService', () => {
  let service: DelegatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DelegatesService],
    }).compile();

    service = module.get<DelegatesService>(DelegatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
