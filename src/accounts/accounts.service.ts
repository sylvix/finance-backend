import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from './account.entity';
import { Repository } from 'typeorm';
import { MutateAccountDto } from './dto/MutateAccount.dto';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>,
  ) {}

  async findById(id: number) {
    const account = await this.accountsRepository.findOneBy({ id });

    if (!account) {
      throw new NotFoundException('This account does not exist');
    }

    return account;
  }

  async findAllForGroup(groupId: number) {
    return this.accountsRepository.find({ where: { groupId }, order: { createdAt: 'ASC' } });
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
