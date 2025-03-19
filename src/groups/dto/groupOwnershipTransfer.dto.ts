import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GroupOwnershipTransferDto {
  @IsInt()
  @ApiProperty({ description: 'ID of the group to transfer ownership' })
  groupId: number;

  @IsInt()
  @ApiProperty({ description: 'ID of the new owner for the group' })
  newOwnerId: number;
}
