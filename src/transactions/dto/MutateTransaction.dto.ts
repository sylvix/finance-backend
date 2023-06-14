import { IsDate, IsNotEmpty, IsOptional, Min, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';
import { Either } from '../../shared/validators/Either.validator';
import { Both } from '../../shared/validators/Both.validator';
import { NotSame } from '../../shared/validators/NotSame.validator';
import { IsPositiveIntOrNull } from '../../shared/validators/IsPositiveIntOrNull.validator';

export class MutateTransactionDto {
  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  conductedAt: Date;

  @Both('incomingAmount')
  @Either('outgoingAccountId')
  @NotSame('outgoingAccountId')
  @IsPositiveIntOrNull()
  incomingAccountId?: number | null;

  @Both('outgoingAmount')
  @Either('incomingAccountId')
  @NotSame('incomingAccountId')
  @IsPositiveIntOrNull()
  outgoingAccountId?: number | null;

  @ValidateIf((object, value) => typeof value === 'number')
  @Min(1)
  incomingAmount?: number | null;

  @ValidateIf((object, value) => typeof value === 'number')
  @Min(1)
  outgoingAmount?: number | null;

  @IsOptional()
  description?: string;
}
