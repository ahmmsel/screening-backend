export type JwtPayload = {
	sub: string;
	email: string;
};

export type JwtRefreshTokenPayload = JwtPayload & { refreshToken: string };
