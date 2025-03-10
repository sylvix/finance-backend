import { UserToken } from '../users/userToken.entity';
import { ClientInfo } from './types';

export const sameClient = (userToken: UserToken, clientInfo: ClientInfo) => {
  const keys: (keyof ClientInfo)[] = ['clientName', 'osName', 'deviceType', 'deviceBrand', 'deviceModel'];

  return keys.every((key) => userToken[key] === clientInfo[key]);
};
