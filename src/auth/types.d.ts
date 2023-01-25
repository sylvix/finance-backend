export interface JwtTokenPayload {
  userId: number;
}

export interface ClientInfo {
  clientName: string;
  osName: string;
  deviceType: string;
  deviceBrand: string;
  deviceModel: string;
}
