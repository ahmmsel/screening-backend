import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class User {
	@Prop()
	firstName: string;

	@Prop()
	lastName: string;

	@Prop({ unique: true })
	email: string;

	@Prop({ required: false, type: Date })
	emailVerified?: Date;

	@Prop()
	password: string;

	@Prop({ required: false })
	hashedRefreshToken?: string;

	@Prop({ required: false })
	hashedSecret?: string;

	@Prop({ required: false })
	scanned?: boolean;
}

export type UserDocument = HydratedDocument<User>;

export const UserSchema = SchemaFactory.createForClass(User);
