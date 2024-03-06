import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const GetUser = createParamDecorator(
	(data: string, ctx: ExecutionContext) => {
		const req = ctx.switchToHttp().getRequest();

		return data ? req.user[data] : req.user;
	},
);
