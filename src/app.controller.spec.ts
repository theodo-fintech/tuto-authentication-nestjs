import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersService } from './users/users.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const mockUsersService = {
      findOneById: jest.fn().mockResolvedValue({
        id: 1,
        email: 'test@test.com',
        firstName: 'World',
      }),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', async () => {
      const mockUser = { id: 1 };
      const result = await appController.getHello(mockUser);
      expect(result).toBe('Hello World!');
    });
  });
});
