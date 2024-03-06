import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OtpTokenGuard extends AuthGuard('jwt-otp') {
	constructor() {
		super();
	}
}
