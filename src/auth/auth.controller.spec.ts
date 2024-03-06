import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should register a new user', async () => {
      // Arrange
      const registerDto: RegisterDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };
      jest
        .spyOn(service, 'register')
        .mockResolvedValueOnce({ nextStep: 'verification' });

      // Act
      const result = await controller.register(registerDto);

      // Assert
      expect(result).toEqual({ nextStep: 'verification' });
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      // Arrange
      const loginDto: LoginDto = {
        email: 'john@example.com',
        password: 'password123',
      };
      jest.spyOn(service, 'login').mockResolvedValueOnce({ nextStep: 'otp' });

      // Act
      const result = await controller.login(loginDto);

      // Assert
      expect(result).toEqual({ nextStep: 'otp' });
    });
  });

  describe('AuthController', () => {
    // Existing code...

    describe('logout', () => {
      it('should log out a user', async () => {
        // Arrange
        const userId = 'user123';
        jest.spyOn(service, 'logout').mockResolvedValueOnce(true);

        // Act
        const result = await controller.logout(userId);

        // Assert
        expect(result).toBe(true);
      });
    });

    describe('refresh', () => {
      it('should refresh tokens for a user', async () => {
        // Arrange
        const userId = 'user123';
        const refreshToken = 'refreshToken123';
        const tokens = {
          accessToken: 'accessToken123',
          refreshToken: 'refreshToken123',
        };
        jest.spyOn(service, 'refreshToken').mockResolvedValueOnce(tokens);

        // Act
        const result = await controller.refresh(userId, refreshToken);

        // Assert
        expect(result).toEqual(tokens);
      });
    });
  });
});
