import { Test, TestingModule } from '@nestjs/testing';
import { DelegatesController } from './delegates.controller';

describe('DelegatesController', () => {
  let controller: DelegatesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DelegatesController],
    }).compile();

    controller = module.get<DelegatesController>(DelegatesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
