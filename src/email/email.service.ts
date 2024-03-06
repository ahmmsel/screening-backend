import { MailerService } from '@nestjs-modules/mailer';
import {
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';
import { EmailVerificationToken } from './schemas/email.schema';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/schemas';

@Injectable()
export class EmailService {
	constructor(
		@InjectModel(EmailVerificationToken.name)
		private readonly emailVerificationTokenModel: Model<EmailVerificationToken>,
		@InjectModel(User.name) private readonly userModel: Model<User>,
		private readonly mailerService: MailerService,
		private readonly config: ConfigService,
	) {}

	async generateToken(email: string): Promise<string> {
		const token = uuidv4();
		// email token will expired after 4 hours
		const expires = new Date(new Date().getTime() + 4 * 3600 * 1000);

		const existingToken = await this.emailVerificationTokenModel.findOne({
			email,
		});

		if (existingToken) {
			await this.emailVerificationTokenModel.deleteOne({
				token: existingToken.token,
			});
		}

		const verificationToken = await this.emailVerificationTokenModel.create({
			email,
			token,
			expires,
		});

		return verificationToken.token;
	}

	async sendVerificationEmail(email: string): Promise<void> {
		const [localPart, domain] = email.split('@');
		const [mainLocalPart, subaddress] = localPart.split('+');

		// Generate verification token
		const verificationToken = await this.generateToken(
			`${mainLocalPart}@${domain}`,
		);

		const subject = 'Verify your email address';

		const verificationLink = `${this.config.get<string>('FRONT_END_URL')}/auth/verification?token=${verificationToken}`;

		// Send verification email
		await this.mailerService.sendMail({
			to: subaddress ? `${mainLocalPart}+${subaddress}@${domain}` : email, // Add subaddress to email if present
			template: './verify',
			subject,
			context: {
				verificationLink,
			},
		});
	}

	// Service method to verify email address
	async verifyEmail(token: string): Promise<boolean> {
		// get existing token
		const existingToken = await this.emailVerificationTokenModel.findOne({
			token,
		});

		// check for existing token
		if (!existingToken) {
			throw new NotFoundException('Token is not found!');
		}

		// check if existing token has been expired
		const hasExpired = new Date(existingToken.expires) < new Date();

		if (hasExpired) {
			throw new ForbiddenException('Token has been expired!');
		}

		// get current user from existing token email
		const currentUser = await this.userModel.findOne({
			email: existingToken.email,
		});

		if (!currentUser) {
			throw new NotFoundException('Email does not exist!');
		}

		// update emailVerified field for current user
		await currentUser.updateOne({ emailVerified: new Date() });

		// delete email verification token
		await this.emailVerificationTokenModel.deleteOne({
			token: existingToken.token,
		});

		return true;
	}
}
