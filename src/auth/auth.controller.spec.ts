import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const authServiceMock = {
  login: jest.fn(),
  validateUser: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;
  let service: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('login should call authService.login', async () => {
    service.login.mockResolvedValue({ access_token: 'token123' });

    const dto = { email: 'test@example.com', password: 'password' };
    const result = await controller.login(dto);

    expect(service.login).toHaveBeenCalled();
    expect(result).toEqual({ access_token: 'token123' });
  });
}); // changed code - Closing brace for describe
