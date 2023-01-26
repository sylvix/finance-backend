import { REFRESH_TOKEN_SEPARATOR } from '../constants';

export const parseRefreshToken = (refreshToken: string) => {
  const [tokenId, rawToken] = refreshToken.split(REFRESH_TOKEN_SEPARATOR);

  return { tokenId: parseInt(tokenId), rawToken };
};
