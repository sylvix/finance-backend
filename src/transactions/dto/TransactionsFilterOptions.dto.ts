import { PageOptionsDto } from '../../shared/dto/PageOptions.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsDate, IsInt, IsOptional } from 'class-validator';

export class TransactionsFilterOptionsDto extends PageOptionsDto {
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiPropertyOptional()
  readonly account?: number;

  @IsDate()
  @IsOptional()
  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  conductedAtStart?: Date;

  @IsDate()
  @IsOptional()
  @ApiPropertyOptional()
  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  conductedAtEnd?: Date;
}
