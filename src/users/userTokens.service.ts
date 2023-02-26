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
    return this.userTokenRepository.findOneBy({ id, expiresAt: MoreThan(new Date()) });
  }

  async create(userTokenData: CreateUserTokenData): Promise<UserToken> {
    const userToken = this.userTokenRepository.create(userTokenData);

    return this.userTokenRepository.save(userToken);
  }

  async removeById(id: number) {
    return this.userTokenRepository.delete({ id });
  }

  async findByUserId(userId: number) {
    return this.userTokenRepository.find({ where: { user: { id: userId } }, order: { expiresAt: 'DESC' } });
  }

  async removeByUserIdAndId(id: number, userId: number) {
    return this.userTokenRepository.delete({ id, user: { id: userId } });
  }

  async removeAllByUserId(userId: number) {
    return this.userTokenRepository.delete({ user: { id: userId } });
  }
}
