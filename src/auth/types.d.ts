export interface JwtTokenPayload {
  userId: number;
}

export interface JwtRefreshTokenPayload {
  userId: number;
  tokenId: number;
}

export interface ClientInfo {
  clientName: string;
  osName: string;
  deviceType: string;
  deviceBrand: string;
  deviceModel: string;
}
