import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { SALT_ROUNDS } from '../constants';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  listenTo() {
    return User;
  }

  async hashPassword(entity: User) {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    entity.password = await bcrypt.hash(entity.password, salt);
  }

  async beforeInsert(event: InsertEvent<User>) {
    await this.hashPassword(event.entity);
  }

  async beforeUpdate(event: UpdateEvent<User>) {
    const entity = event.entity as User;
    const databaseEntity = event.databaseEntity;

    if (entity && entity.password && entity.password !== databaseEntity.password) {
      await this.hashPassword(entity);
    }
  }
}
