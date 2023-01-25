import { User } from './user.entity';
import { ClientInfo } from '../auth/types';

export interface CreateUserTokenData extends ClientInfo {
  user: User;
  hashedToken: string;
  expiresAt: Date;
}
