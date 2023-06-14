import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';
import { PageOptionsDto } from '../shared/dto/PageOptions.dto';
import { PageMetaDto } from '../shared/dto/PageMeta.dto';
import { PageDto } from '../shared/dto/Page.dto';
import { MutateTransactionDto } from './dto/MutateTransaction.dto';
import { GroupsService } from '../groups/groups.service';
import { AccountsService } from '../accounts/accounts.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly groupsService: GroupsService,
    private readonly accountsService: AccountsService,
  ) {}

  async findById(id: number) {
    const transaction = await this.transactionRepository.findOneBy({ id });

    if (!transaction) {
      throw new NotFoundException('This transaction does not exist');
    }

    return transaction;
  }

  async getAll(groupId: number, pageOptionsDto: PageOptionsDto) {
    const [entities, itemCount] = await this.transactionRepository.findAndCount({
      where: { groupId },
      order: { conductedAt: 'DESC' },
      take: pageOptionsDto.take,
      skip: pageOptionsDto.skip,
    });

    const pageMetaDto = new PageMetaDto({ pageOptionsDto, itemCount });

    return new PageDto(entities, pageMetaDto);
  }

  async create(groupId: number, mutateTransactionDto: MutateTransactionDto) {
    const transaction = await this.transactionRepository.create({
      groupId,
      ...mutateTransactionDto,
    });

    return this.transactionRepository.save(transaction);
  }

  async edit(userId: number, id: number, mutateTransactionDto: MutateTransactionDto) {
    const transaction = await this.findById(id);

    await this.checkUserInGroup(userId, transaction.groupId);

    if (mutateTransactionDto.incomingAccountId) {
      await this.checkAccount(mutateTransactionDto.incomingAccountId, transaction.groupId);
    }

    if (mutateTransactionDto.outgoingAccountId) {
      await this.checkAccount(mutateTransactionDto.outgoingAccountId, transaction.groupId);
    }

    transaction.conductedAt = mutateTransactionDto.conductedAt;
    transaction.incomingAccountId = mutateTransactionDto.incomingAccountId || null;
    transaction.outgoingAccountId = mutateTransactionDto.outgoingAccountId || null;
    transaction.incomingAmount = mutateTransactionDto.incomingAmount || null;
    transaction.outgoingAmount = mutateTransactionDto.outgoingAmount || null;
    transaction.description = mutateTransactionDto.description;

    return this.transactionRepository.save(transaction);
  }

  async remove(userId: number, id: number) {
    const transaction = await this.findById(id);
    await this.checkUserInGroup(userId, transaction.groupId);
    await this.transactionRepository.remove(transaction);
  }

  private async checkUserInGroup(userId: number, groupId: number) {
    const userIsInGroup = await this.groupsService.userIsInGroup(userId, groupId);

    if (!userIsInGroup) {
      throw new ForbiddenException('You cannot edit this transaction');
    }
  }

  private async checkAccount(accountId: number, groupId: number) {
    const accountIsInGroup = await this.accountsService.accountIsInGroup(accountId, groupId);

    if (!accountIsInGroup) {
      throw new ForbiddenException('You cannot assign accounts not in your group');
    }
  }
}
