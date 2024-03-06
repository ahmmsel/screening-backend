import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpDto } from './dto';
import { GetCurrentUserId } from '../common/decorators';
import { OtpTokenGuard } from '../common/guards';

@UseGuards(OtpTokenGuard)
@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Get('setup')
  @HttpCode(HttpStatus.OK)
  setup(@GetCurrentUserId() userId: string) {
    return this.otpService.setupTwoFactorAuth(userId);
  }

  @Post('confirm-scanning')
  @HttpCode(HttpStatus.OK)
  confirm(@GetCurrentUserId() userId: string) {
    return this.otpService.confirmScanning(userId);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  verify(@Body() dto: OtpDto, @GetCurrentUserId() userId: string) {
    return this.otpService.verifyTwoFactorAuth(dto, userId);
  }
}
