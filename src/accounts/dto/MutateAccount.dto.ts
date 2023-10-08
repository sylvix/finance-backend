import { IsEnum, IsNotEmpty } from 'class-validator';
import { IsCurrencyCode } from 'src/currencies/validators/isCurrencyCode.validator';
import { AccountType } from '../account.entity';
import { IsPositiveIntOrNull } from '../../shared/validators/IsPositiveIntOrNull.validator';

export class MutateAccountDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsCurrencyCode()
  currency: string;

  @IsEnum(AccountType)
  type: AccountType;

  @IsPositiveIntOrNull()
  lockedBalance?: number | null;
}
