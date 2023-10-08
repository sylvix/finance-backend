import { AccountType } from '../account.entity';
import { CurrencyDto } from '../../currencies/dto/currency.dto';
import { AccountWithTotalQueryResultDto } from './AccountWithTotalQueryResult.dto';

export class AccountWithTotalDto {
  constructor(queryResult: AccountWithTotalQueryResultDto, currency: CurrencyDto) {
    this.id = queryResult.account_id;
    this.groupId = queryResult.account_groupId;
    this.name = queryResult.account_name;
    this.type = queryResult.account_type;
    this.currency = currency;
    this.createdAt = queryResult.account_createdAt;
    this.total = queryResult.total || '0';
    this.incoming = queryResult.incoming || '0';
    this.outgoing = queryResult.outgoing || '0';
    this.lockedBalance = queryResult.account_lockedBalance || '0';
  }

  id: number;
  groupId: number;
  name: string;
  type: AccountType;
  currency: CurrencyDto;
  createdAt: string;
  incoming: string;
  outgoing: string;
  total: string;
  lockedBalance: string;
}
