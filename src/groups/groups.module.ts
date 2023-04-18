import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './group.entity';
import { UserToGroup } from './userToGroup.entity';
import { GroupsService } from './groups.service';
import { UserGroupGuard } from '../auth/userGroup.guard';
import { GroupsController } from './groups.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Group, UserToGroup]), forwardRef(() => UsersModule)],
  providers: [GroupsService, UserGroupGuard],
  exports: [GroupsService, UserGroupGuard],
  controllers: [GroupsController],
})
export class GroupsModule {}
