import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../types';

@Injectable()
export class OtpTokenStrategy extends PassportStrategy(Strategy, 'jwt-otp') {
	constructor(private readonly config: ConfigService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: config.get<string>('JWT_OTP_TOKEN'),
		});
	}

	validate(payload: JwtPayload) {
		return payload;
	}
}
