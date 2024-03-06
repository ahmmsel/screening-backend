import {
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './schemas/users.schema';
import { AccessTokenGuard } from 'src/common/guards';
import { GetCurrentUserId } from 'src/common/decorators/get-current-user-id.decorator';

@Controller()
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@UseGuards(AccessTokenGuard)
	@Get('me')
	@HttpCode(HttpStatus.OK)
	async currentUser(@GetCurrentUserId() userId: string): Promise<User> {
		return this.usersService.findUserById(userId);
	}
}
