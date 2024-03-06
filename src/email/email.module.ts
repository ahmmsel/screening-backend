import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { MongooseModule } from '@nestjs/mongoose';
import {
  EmailVerificationToken,
  EmailVerificationTokenSchema,
} from './schemas/email.schema';
import { User, UserSchema } from '../users/schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: EmailVerificationToken.name,
        schema: EmailVerificationTokenSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          port: Number(587),
          auth: {
            user: config.get<string>('EMAIL_USER'),
            pass: config.get<string>('EMAIL_PASS'),
          },
        },
        defaults: {
          from: `"From" ${config.get<string>('EMAIL')}`,
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new EjsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  exports: [EmailService],
  controllers: [EmailController],
  providers: [EmailService],
})
export class EmailModule {}
