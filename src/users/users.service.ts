import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOne(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  async create(email: string, password: string, displayName: string): Promise<User> {
    const user = this.usersRepository.create({
      email,
      password,
      displayName,
    });

    return this.usersRepository.save(user);
  }
}
