import { IsEnum, IsNotEmpty } from 'class-validator';
import { IsCurrencyCode } from 'src/currencies/validators/isCurrencyCode.validator';
import { AccountType } from '../account.entity';

export class MutateAccountDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsCurrencyCode()
  currency: string;

  @IsEnum(AccountType)
  type: string;
}
