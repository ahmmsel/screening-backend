import { Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('verification/:token')
  @HttpCode(HttpStatus.OK)
  async verify(@Param('token') token: string) {
    return this.emailService.verifyEmail(token);
  }
}
