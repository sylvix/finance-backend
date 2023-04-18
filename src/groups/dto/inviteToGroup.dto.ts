import { IsEmail, IsNotEmpty } from 'class-validator';

export class InviteToGroupDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
