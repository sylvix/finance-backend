import { IsEmail, IsNotEmpty } from 'class-validator';
import { UniqueUserEmail } from '../../users/validators/uniqueUserEmail.validator';
import { RegisterSecret } from '../../users/validators/registerSecret.validator';

export class RegisterDto {
  @IsEmail()
  @UniqueUserEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  displayName: string;

  @IsNotEmpty()
  @RegisterSecret()
  secret?: string;
}
