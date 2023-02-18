import { IsEmail, IsNotEmpty } from 'class-validator';
import { UniqueUserEmail } from '../validators/uniqueUserEmail.validator';
import { PartialType } from '@nestjs/swagger';

export class EditProfileValidationDto {
  @IsEmail()
  @UniqueUserEmail()
  email: string;

  @IsNotEmpty()
  displayName: string;
}

export class EditProfileDto extends PartialType(EditProfileValidationDto) {}
