import { Injectable } from '@nestjs/common';
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

  async getAllForGroup(groupId: number) {
    return this.accountsRepository.find({ where: { groupId }, order: { createdAt: 'ASC' } });
  }

  async create(groupId: number, mutateDto: MutateAccountDto) {
    const account = this.accountsRepository.create({
      ...mutateDto,
      groupId,
    });

    return this.accountsRepository.save(account);
  }
}
