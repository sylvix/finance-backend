import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    const isValid = user && (await user.validatePassword(pass));

    if (isValid) {
      return user;
    }

    return null;
  }
}
