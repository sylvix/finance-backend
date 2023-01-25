import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtTokenPayload } from './types';

export const TokenPayload = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user as JwtTokenPayload;
});
