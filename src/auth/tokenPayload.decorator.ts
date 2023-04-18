import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtRefreshTokenPayload, AccessTokenPayload } from './types';

export const TokenPayload = createParamDecorator((data: void, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user as AccessTokenPayload;
});

export const RefreshTokenPayload = createParamDecorator((data: void, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user as JwtRefreshTokenPayload;
});
