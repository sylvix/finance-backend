import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';
import { PageOptionsDto } from '../shared/dto/PageOptions.dto';
import { PageMetaDto } from '../shared/dto/PageMeta.dto';
import { PageDto } from '../shared/dto/Page.dto';
import { MutateTransactionDto } from './dto/MutateTransaction.dto';
import { AccountsService } from '../accounts/accounts.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
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

  async edit(id: number, mutateTransactionDto: MutateTransactionDto) {
    const transaction = await this.findById(id);

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

  async remove(id: number) {
    const transaction = await this.findById(id);
    await this.transactionRepository.remove(transaction);
  }

  async isTransactionInGroup(id: number, groupId: number) {
    const count = await this.transactionRepository.count({ where: { id, groupId } });

    return count === 1;
  }

  private async checkAccount(accountId: number, groupId: number) {
    const accountIsInGroup = await this.accountsService.isAccountInGroup(accountId, groupId);

    if (!accountIsInGroup) {
      throw new ForbiddenException('You cannot assign accounts not in your group');
    }
  }
}
