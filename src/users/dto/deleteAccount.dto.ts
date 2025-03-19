import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { GroupOwnershipTransferDto } from '../../groups/dto/groupOwnershipTransfer.dto';

export class DeleteAccountDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GroupOwnershipTransferDto)
  @ApiProperty({
    type: [GroupOwnershipTransferDto],
    description: 'Array of group ownership transfers to perform before account deletion',
  })
  groupTransfers: GroupOwnershipTransferDto[];
}
