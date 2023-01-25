import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { UserToken } from './userToken.entity';
import { CreateUserTokenData } from './types';

@Injectable()
export class UserTokensService {
  constructor(
    @InjectRepository(UserToken)
    private userTokenRepository: Repository<UserToken>,
  ) {}

  async findByIdAndExpirationDate(id: number): Promise<UserToken | null> {
    return this.userTokenRepository.findOne({
      where: { id, expiresAt: MoreThan(new Date()) },
      relations: { user: true },
    });
  }

  async create(userTokenData: CreateUserTokenData): Promise<UserToken> {
    const userToken = this.userTokenRepository.create(userTokenData);

    return this.userTokenRepository.save(userToken);
  }

  async removeById(id: number) {
    return this.userTokenRepository.delete({ id });
  }
}