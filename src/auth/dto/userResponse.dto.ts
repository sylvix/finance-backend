import { User } from '../../users/user.entity';
import { TokensDto } from './tokens.dto';

export class UserResponseDto {
  constructor(user: User, tokens: TokensDto) {
    this.user = user;
    this.tokens = tokens;
  }

  user: User;
  tokens: TokensDto;
}
