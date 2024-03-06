import { Test, TestingModule } from '@nestjs/testing';
import { OtpController } from './otp.controller';
import { OtpService } from './otp.service';
import { OtpDto } from './dto';

describe('OtpController', () => {
  let controller: OtpController;
  let otpService: OtpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OtpController],
      providers: [OtpService],
    }).compile();

    controller = module.get<OtpController>(OtpController);
    otpService = module.get<OtpService>(OtpService);
  });

  describe('setup', () => {
    it('should call otpService.setupTwoFactorAuth with the provided userId', () => {
      // Arrange
      const userId = 'mockedUserId';

      // Act
      controller.setup(userId);

      // Assert
      expect(otpService.setupTwoFactorAuth).toHaveBeenCalledWith(userId);
    });
  });

  describe('confirm', () => {
    it('should call otpService.confirmScanning with the provided userId', () => {
      // Arrange
      const userId = 'mockedUserId';

      // Act
      controller.confirm(userId);

      // Assert
      expect(otpService.confirmScanning).toHaveBeenCalledWith(userId);
    });
  });

  describe('verify', () => {
    it('should call otpService.verifyTwoFactorAuth with the provided dto and userId', () => {
      // Arrange
      const userId = 'mockedUserId';
      const dto: OtpDto = { otp: '123456' };

      // Act
      controller.verify(dto, userId);

      // Assert
      expect(otpService.verifyTwoFactorAuth).toHaveBeenCalledWith(dto, userId);
    });
  });
});
