import { Injectable } from '@nestjs/common';
import { EntityInGroupGuard } from '../../shared/guards/EntityInGroup.guard';
import { TransactionsService } from '../transactions.service';

@Injectable()
export class TransactionInGroupGuard extends EntityInGroupGuard {
  constructor(private transactionsService: TransactionsService) {
    super();
  }

  async entityIsInGroup(entityId: number, groupId: number): Promise<boolean> {
    return this.transactionsService.isTransactionInGroup(entityId, groupId);
  }
}
