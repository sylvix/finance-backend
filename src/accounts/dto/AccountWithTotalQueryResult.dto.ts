import { AccountType } from '../account.entity';

export class AccountWithTotalQueryResultDto {
  account_id: number;
  account_groupId: number;
  account_name: string;
  account_currency: string;
  account_type: AccountType;
  account_createdAt: string;
  account_lockedBalance: string | null;
  incomingAccountId: number;
  incoming: string | null;
  outgoingAccountId: number;
  outgoing: string | null;
  total: string | null;
}
