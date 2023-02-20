import { IsNotEmpty } from 'class-validator';

export class EditPasswordDto {
  @IsNotEmpty()
  oldPassword: string;

  @IsNotEmpty()
  newPassword: string;
}
