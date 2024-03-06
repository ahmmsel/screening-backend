import {
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/users.schema';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
	constructor(
		@InjectModel(User.name) private readonly userModel: Model<User>,
	) {}

	async findUserById(id: string): Promise<User> {
		try {
			const user = await this.userModel.findById(id);

			if (!user) {
				throw new NotFoundException('User not found!');
			}

			return user;
		} catch (error) {
			throw new InternalServerErrorException('Internal Server Error');
		}
	}
}
