import { IsNotEmpty } from 'class-validator';

export class RevokeFromGroupDto {
  @IsNotEmpty()
  userId: number;
}
