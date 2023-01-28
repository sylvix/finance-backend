import { REFRESH_TOKEN_SEPARATOR } from '../constants';
import { UserToken } from '../users/userToken.entity';
import { ClientInfo } from './types';

export const parseRefreshToken = (refreshToken: string) => {
  const [tokenId, rawToken] = refreshToken.split(REFRESH_TOKEN_SEPARATOR);

  return { tokenId: parseInt(tokenId), rawToken };
};

export const sameClient = (userToken: UserToken, clientInfo: ClientInfo) => {
  const keys: (keyof ClientInfo)[] = ['clientName', 'osName', 'deviceType', 'deviceBrand', 'deviceModel'];

  return keys.every((key) => userToken[key] === clientInfo[key]);
};
