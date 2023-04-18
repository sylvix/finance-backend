import { IsNotEmpty } from 'class-validator';

export class EditGroupDto {
  @IsNotEmpty()
  name: string;
}
