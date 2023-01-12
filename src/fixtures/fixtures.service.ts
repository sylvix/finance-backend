import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class FixturesService {
  constructor(private usersService: UsersService) {}

  async createUsers() {
    await this.usersService.create('test@test.com', '1qaz@WSXTest', 'Test User');
  }
}
