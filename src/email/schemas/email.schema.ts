import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class EmailVerificationToken {
	@Prop()
	email: string;

	@Prop({ unique: true })
	token: string;

	@Prop()
	expires: Date;
}

export type EmailVerificationTokenDocument =
	HydratedDocument<EmailVerificationToken>;

export const EmailVerificationTokenSchema = SchemaFactory.createForClass(
	EmailVerificationToken,
);
