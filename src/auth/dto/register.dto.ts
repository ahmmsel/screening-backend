import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class RegisterDto {
	@IsString()
	@IsNotEmpty()
	firstName: string;

	@IsString()
	@IsNotEmpty()
	lastName;

	@IsEmail()
	@IsNotEmpty()
	email;

	@Matches(
		/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+={}\[\]:;"'<>,.?/\\~-]).{8,}$/,
	)
	@IsString()
	@IsNotEmpty()
	password;
}
