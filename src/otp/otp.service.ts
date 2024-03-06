import {
	BadRequestException,
	ForbiddenException,
	Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { User } from '../users/schemas/users.schema';
import { OtpDto } from './dto';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';
import { Tokens } from '../auth/types';

@Injectable()
export class OtpService {
	constructor(
		@InjectModel(User.name) private readonly userModel: Model<User>,
		private readonly usersService: UsersService,
		private readonly authService: AuthService,
	) {}

	/*
		setupTwoFactorAuth is a service that accept userId and return QRcode url
	*/
	async setupTwoFactorAuth(
		userId: string,
	): Promise<{ qrCodeUrl: string } | boolean> {
		const user = await this.userModel.findById(userId);

		const secret = speakeasy.generateSecret({ length: 20, name: 'Screening' });

		await user.updateOne({ hashedSecret: secret.base32 });

		await user.save();

		const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

		return { qrCodeUrl };
	}

	async confirmScanning(userId: string) {
		await this.userModel.findByIdAndUpdate(userId, { scanned: true });
	}

	/*
		verifyTwoFactorAuth is a service verify otp coming from authenticator
		accept 2 param (otpDto, userId)
	*/
	async verifyTwoFactorAuth(otpDto: OtpDto, userId: string): Promise<Tokens> {
		const user = await this.usersService.findUserById(userId);

		const hashedSecret = user.hashedSecret;

		if (!hashedSecret) {
			throw new ForbiddenException('Please connect authenticator via QR Code!');
		}

		const verified = speakeasy.totp.verify({
			secret: hashedSecret,
			encoding: 'base32',
			token: otpDto.otp,
		});

		if (!verified) {
			throw new BadRequestException('Invalid OTP');
		}

		await this.userModel.findByIdAndUpdate(userId, { otpVerified: verified });

		const tokens = await this.authService.getTokens({
			sub: userId,
			email: user.email,
		});
		await this.authService.updateRefreshTokenHash(userId, tokens.refreshToken);

		return {
			accessToken: tokens.accessToken,
			refreshToken: tokens.refreshToken,
		};
	}
}
