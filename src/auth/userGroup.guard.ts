import { ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { GroupsService } from '../groups/groups.service';
import { AccessTokenPayload } from './types';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class UserGroupGuard extends JwtAuthGuard {
  constructor(private readonly groupsService: GroupsService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const result = await (super.canActivate(context) as Promise<boolean>);

    if (!result) {
      return false;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const payload = request.user as AccessTokenPayload;

    const isInGroup = await this.groupsService.userIsInGroup(payload.userId, payload.groupId);

    if (!isInGroup) {
      try {
        await this.groupsService.resetDefaultGroup(payload.userId);
      } catch {
        /* empty */
      }

      return false;
    }

    return true;
  }
}
