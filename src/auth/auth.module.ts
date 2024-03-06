import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { User, UserSchema } from '../users/schemas';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import {
	AccessTokenStrategy,
	RefreshTokenStrategy,
	OtpTokenStrategy,
} from './strategies';
import { EmailModule } from '../email/email.module';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
		JwtModule.register({}),
		UsersModule,
		EmailModule,
		PassportModule,
	],
	exports: [AuthService],
	controllers: [AuthController],
	providers: [
		AuthService,
		AccessTokenStrategy,
		RefreshTokenStrategy,
		OtpTokenStrategy,
	],
})
export class AuthModule {}
