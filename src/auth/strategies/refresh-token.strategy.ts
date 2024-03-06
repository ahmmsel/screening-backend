import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload, JwtRefreshTokenPayload } from '../types';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
	Strategy,
	'jwt-refresh',
) {
	constructor(private readonly config: ConfigService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: config.get<string>('JWT_REFRESH_TOKEN'),
			passReqToCallback: true,
		});
	}

	validate(req: Request, payload: JwtPayload): JwtRefreshTokenPayload {
		const refreshToken = req
			?.get('authorization')
			?.replace('Bearer', '')
			.trim();

		if (!refreshToken) throw new ForbiddenException('Refresh token malformed');

		return {
			...payload,
			refreshToken,
		};
	}
}
