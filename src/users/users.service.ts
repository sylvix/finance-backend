import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async create(email: string, password: string, displayName: string): Promise<User> {
    const user = this.usersRepository.create({
      email,
      password,
      displayName,
    });

    return this.usersRepository.save(user);
  }

  async register(registerDto: RegisterDto): Promise<User> {
    delete registerDto.secret;

    const user = this.usersRepository.create(registerDto);
    return this.usersRepository.save(user);
  }
}
