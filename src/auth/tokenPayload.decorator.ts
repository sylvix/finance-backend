import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtRefreshTokenPayload, AccessTokenPayload } from './types';
import { Request } from 'express';

export const TokenPayload = createParamDecorator((_data: void, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<Request>();
  return request.user as AccessTokenPayload;
});

export const RefreshTokenPayload = createParamDecorator((_data: void, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<Request>();
  return request.user as JwtRefreshTokenPayload;
});
