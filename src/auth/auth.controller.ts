import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Post,
	UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';
import { AccessTokenGuard, RefreshTokenGuard } from '../common/guards';
import { GetUser, GetCurrentUserId } from '../common/decorators';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('register')
	@HttpCode(HttpStatus.CREATED)
	register(@Body() dto: RegisterDto) {
		return this.authService.register(dto);
	}

	@Post('login')
	@HttpCode(HttpStatus.OK)
	login(@Body() dto: LoginDto) {
		return this.authService.login(dto);
	}

	@UseGuards(AccessTokenGuard)
	@Post('logout')
	@HttpCode(HttpStatus.OK)
	logout(@GetCurrentUserId() userId: string) {
		return this.authService.logout(userId);
	}

	@UseGuards(RefreshTokenGuard)
	@Post('refresh')
	@HttpCode(HttpStatus.OK)
	refresh(
		@GetCurrentUserId() userId: string,
		@GetUser('refreshToken') refreshToken: string,
	) {
		return this.authService.refreshToken(userId, refreshToken);
	}
}
