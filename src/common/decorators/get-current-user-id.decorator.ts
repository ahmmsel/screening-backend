import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { JwtPayload } from 'src/auth/types';

export const GetCurrentUserId = createParamDecorator(
	(_data: unknown, ctx: ExecutionContext) => {
		const req = ctx.switchToHttp().getRequest();
		const user = req.user as JwtPayload;

		return user.sub;
	},
);
