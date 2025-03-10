import { ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { AccessTokenPayload } from './types';

@Injectable()
export class UserGuard extends JwtAuthGuard {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const result = await (super.canActivate(context) as Promise<boolean>);

    if (!result) {
      return false;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const payload = request.user as AccessTokenPayload;
    const user = await this.usersService.findById(payload.userId);

    if (!user) {
      return false;
    }

    request.user = user;
    return true;
  }
}
