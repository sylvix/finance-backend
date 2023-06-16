import { Injectable } from '@nestjs/common';
import { AccountsService } from '../accounts.service';
import { EntityInGroupGuard } from '../../shared/guards/EntityInGroup.guard';

@Injectable()
export class AccountInGroupGuard extends EntityInGroupGuard {
  constructor(private accountsService: AccountsService) {
    super();
  }

  async entityIsInGroup(entityId: number, groupId: number): Promise<boolean> {
    return this.accountsService.isAccountInGroup(entityId, groupId);
  }
}
