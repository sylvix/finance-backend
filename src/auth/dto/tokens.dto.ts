export class TokensDto {
  access: string;
  refresh: string;
}

export class AccessTokenDto {
  constructor(access: string) {
    this.access = access;
  }

  access: string;
}
