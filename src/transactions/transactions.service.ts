import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';
import { PageOptionsDto } from '../shared/dto/PageOptions.dto';
import { PageMetaDto } from '../shared/dto/PageMeta.dto';
import { PageDto } from '../shared/dto/Page.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async getAll(groupId: number, pageOptionsDto: PageOptionsDto) {
    const [entities, itemCount] = await this.transactionRepository.findAndCount({
      where: { groupId },
      order: { conductedAt: 'ASC' },
      take: pageOptionsDto.take,
      skip: pageOptionsDto.skip,
    });

    const pageMetaDto = new PageMetaDto({ pageOptionsDto, itemCount });

    return new PageDto(entities, pageMetaDto);
  }
}
