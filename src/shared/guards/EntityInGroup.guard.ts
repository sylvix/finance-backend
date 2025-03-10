import { CanActivate, ExecutionContext } from '@nestjs/common';
import { AccessTokenPayload } from '../../auth/types';
import { Request } from 'express';

export abstract class EntityInGroupGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const { id: entityId } = request.params;
    const payload = request.user as AccessTokenPayload;

    if (!payload) {
      throw new Error('This guard needs to be used after token authentication');
    }

    return this.entityIsInGroup(parseInt(entityId), payload.groupId);
  }

  abstract entityIsInGroup(entityId: number, groupId: number): Promise<boolean>;
}
