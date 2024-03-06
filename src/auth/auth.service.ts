import {
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as argon from 'argon2';
import { LoginDto, RegisterDto } from './dto';
import { User } from '../users/schemas';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, NextStep, NextStepWithOtpToken, Tokens } from './types';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
	constructor(
		@InjectModel(User.name) private readonly userModel: Model<User>,
		private readonly jwtService: JwtService,
		private readonly emailService: EmailService,
		private readonly config: ConfigService,
	) {}

	// Service method to create and register new user
	async register(registerDto: RegisterDto): Promise<NextStep> {
		const existingUser = await this.userModel.findOne({
			email: registerDto.email,
		});

		if (existingUser) {
			throw new ForbiddenException('Email Already in use!');
		}

		const hash = await argon.hash(registerDto.password);

		const user = await this.userModel.create({
			firstName: registerDto.firstName,
			lastName: registerDto.lastName,
			email: registerDto.email,
			password: hash,
		});

		await this.emailService.sendVerificationEmail(user.email);

		return { nextStep: 'verification' };
	}

	// Service method to enable user to login
	async login(loginDto: LoginDto): Promise<NextStepWithOtpToken | NextStep> {
		const user = await this.userModel.findOne({ email: loginDto.email });

		if (!user) {
			throw new NotFoundException('User does not exist');
		}

		// before login check if email verified or not and sendVerification token if not verified
		if (!user.emailVerified) {
			await this.emailService.sendVerificationEmail(user.email);

			return { nextStep: 'verification' };
		}

		const passwordMatch = await argon.verify(user.password, loginDto.password);

		if (!passwordMatch) {
			throw new ForbiddenException('Password incorrect!');
		}

		const otpToken = await this.generateOtpToken({
			sub: String(user._id),
			email: user.email,
		});

		//chech if user already have scan the QR Code for OTP
		if (user.scanned) {
			return {
				nextStep: 'otp',
				otpToken,
			};
		}

		return { nextStep: 'generate-otp', otpToken };
	}

	// Service method to handle logout case
	async logout(userId: string): Promise<boolean> {
		await this.userModel.findByIdAndUpdate(userId, {
			hashedRefreshToken: null,
		});

		return true;
	}

	// Service method to refresh token
	async refreshToken(userId: string, refreshToken: string): Promise<Tokens> {
		const user = await this.userModel.findById(userId);

		if (!user || !user.hashedRefreshToken) {
			throw new ForbiddenException('Access Denied!');
		}

		// check if refresh token match the hashed one
		const refreshTokenMatch = await argon.verify(
			user.hashedRefreshToken,
			refreshToken,
		);
		// if is not match throw an forbidden exception
		if (!refreshTokenMatch) {
			throw new ForbiddenException('Invalid Refresh Token!');
		}

		const tokens = await this.getTokens({ sub: userId, email: user.email });

		// update refresh token hash
		await this.updateRefreshTokenHash(userId, tokens.refreshToken);

		return {
			refreshToken: tokens.refreshToken,
			accessToken: tokens.accessToken,
		};
	}

	// Service method to update refresh token in database
	async updateRefreshTokenHash(
		userId: string,
		refreshToken: string,
	): Promise<void> {
		// Hash refresh token to store it securly in database
		const hashedRefreshToken = await argon.hash(refreshToken);

		// update user refreshToken
		const user = await this.userModel.findById(userId);

		await user.updateOne({ hashedRefreshToken });

		await user.save();
	}

	async getTokens(payload: JwtPayload): Promise<Tokens> {
		const [refreshToken, accessToken] = await Promise.all([
			this.jwtService.signAsync(payload, {
				secret: this.config.get<string>('JWT_REFRESH_TOKEN'),
				expiresIn: '30m',
			}),
			this.jwtService.signAsync(payload, {
				secret: this.config.get<string>('JWT_ACCESS_TOKEN'),
				expiresIn: '15m',
			}),
		]);

		return { refreshToken, accessToken };
	}

	// Service method to generate OTP token
	async generateOtpToken(payload: JwtPayload): Promise<string> {
		const otpToken = await this.jwtService.signAsync(payload, {
			secret: this.config.get<string>('JWT_OTP_TOKEN'),
			expiresIn: '15m',
		});

		return otpToken;
	}
}
