import { IsEmail, IsNotEmpty } from 'class-validator';
import { UniqueUserEmail } from '../validators/uniqueUserEmail.validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class EditProfileValidationDto {
  @IsEmail()
  @UniqueUserEmail()
  email: string;

  @IsNotEmpty()
  displayName: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  avatar: Express.Multer.File;
}

export class EditProfileDto extends PartialType(EditProfileValidationDto) {}
