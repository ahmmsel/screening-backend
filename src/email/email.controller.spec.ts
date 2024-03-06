import { Test, TestingModule } from '@nestjs/testing';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';

describe('EmailController', () => {
  let controller: EmailController;
  let emailService: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailController],
      providers: [
        {
          provide: EmailService,
          useValue: {
            verifyEmail: jest.fn(), // Mock the verifyEmail method
          },
        },
      ],
    }).compile();

    controller = module.get<EmailController>(EmailController);
    emailService = module.get<EmailService>(EmailService);
  });

  describe('verify', () => {
    it('should call emailService.verifyEmail with the provided token', async () => {
      // Arrange
      const token = 'mockedToken';

      // Act
      await controller.verify(token);

      // Assert
      expect(emailService.verifyEmail).toHaveBeenCalledWith(token);
    });

    it('should return the result from emailService.verifyEmail', async () => {
      // Arrange
      const expectedResult = 'mockedResult';
      (emailService.verifyEmail as jest.Mock).mockResolvedValue(expectedResult);
      const token = 'mockedToken';

      // Act
      const result = await controller.verify(token);

      // Assert
      expect(result).toBe(expectedResult);
    });
  });
});
