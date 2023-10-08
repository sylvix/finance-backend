import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from './account.entity';
import { Repository } from 'typeorm';
import { MutateAccountDto } from './dto/MutateAccount.dto';
import { Transaction } from '../transactions/transaction.entity';
import { AccountWithTotalQueryResultDto } from './dto/AccountWithTotalQueryResult.dto';
import { AccountWithTotalDto } from './dto/AccountWithTotal.dto';
import { CurrenciesService } from '../currencies/currencies.service';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>,
    private readonly currenciesService: CurrenciesService,
  ) {}

  async findById(id: number) {
    const account = await this.accountsRepository.findOneBy({ id });

    if (!account) {
      throw new NotFoundException('This account does not exist');
    }

    return account;
  }

  async findAllForGroup(groupId: number) {
    return this.accountsRepository.find({ where: { groupId }, order: { name: 'ASC' } });
  }

  async findAllWithTotal(groupId: number) {
    const queryResults = await this.accountsRepository
      .createQueryBuilder('account')
      .where('account.groupId = :groupId', { groupId })
      .leftJoinAndSelect(
        (qb) =>
          qb
            .from(Transaction, 'transaction')
            .addSelect('transaction.incomingAccountId', 'incomingAccountId')
            .addSelect('SUM(transaction.incomingAmount)', 'incoming')
            .groupBy('transaction.incomingAccountId'),
        'incoming',
        '"incoming"."incomingAccountId" = account.id',
      )
      .leftJoinAndSelect(
        (qb) =>
          qb
            .from(Transaction, 'transaction')
            .addSelect('transaction.outgoingAccountId', 'outgoingAccountId')
            .addSelect('SUM(transaction.outgoingAmount)', 'outgoing')
            .groupBy('transaction.outgoingAccountId'),
        'outgoing',
        '"outgoing"."outgoingAccountId" = account.id',
      )
      .addSelect('COALESCE("incoming", 0) - COALESCE("outgoing", 0)', 'total')
      .orderBy('name', 'ASC')
      .getRawMany<AccountWithTotalQueryResultDto>();

    return Promise.all(
      queryResults.map(async (queryResult) => {
        return new AccountWithTotalDto(queryResult, await this.currenciesService.findOne(queryResult.account_currency));
      }),
    );
  }

  async create(groupId: number, mutateDto: MutateAccountDto) {
    const account = this.accountsRepository.create({
      ...mutateDto,
      groupId,
    });

    return this.accountsRepository.save(account);
  }

  async edit(id: number, mutateDto: MutateAccountDto) {
    const account = await this.findById(id);

    account.name = mutateDto.name;
    account.type = mutateDto.type;
    account.currency = mutateDto.currency;
    account.lockedBalance = mutateDto.lockedBalance ?? null;

    return this.accountsRepository.save(account);
  }

  async remove(id: number) {
    const account = await this.findById(id);
    await this.accountsRepository.remove(account);
  }

  async isAccountInGroup(id: number, groupId: number) {
    const count = await this.accountsRepository.count({ where: { id, groupId } });

    return count === 1;
  }
}
