import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserInGroupRole, UserToGroup } from './userToGroup.entity';
import { In, Not, Repository } from 'typeorm';
import { Group } from './group.entity';
import { User } from '../users/user.entity';
import { CreateGroupDto } from './dto/createGroup.dto';
import { UsersService } from '../users/users.service';
import { EditGroupDto } from './dto/editGroup.dto';
import { GroupOwnershipTransferDto } from './dto/groupOwnershipTransfer.dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(UserToGroup)
    private readonly userToGroupsRepository: Repository<UserToGroup>,
    @InjectRepository(Group)
    private readonly groupsRepository: Repository<Group>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  async userIsInGroup(userId: number, groupId: number) {
    const count = await this.userToGroupsRepository.count({ where: { groupId, userId } });
    return count === 1;
  }

  async userIsOwnerOfGroup(userId: number, groupId: number) {
    const count = await this.userToGroupsRepository.count({ where: { groupId, userId, role: UserInGroupRole.OWNER } });
    return count === 1;
  }

  async createDefaultGroup(user: User) {
    const group = this.groupsRepository.create({ name: user.displayName + "'s group" });
    await this.groupsRepository.save(group);
    const userToGroup = this.userToGroupsRepository.create({
      group,
      role: UserInGroupRole.OWNER,
    });

    if (user.userToGroups) {
      user.userToGroups.push(userToGroup);
    } else {
      user.userToGroups = [userToGroup];
    }

    user.defaultGroup = group;
  }

  async getDefaultGroup(userId: number, exceptGroupId?: number) {
    const defaultGroupToUser = await this.userToGroupsRepository.findOne({
      where: { userId, role: UserInGroupRole.OWNER, groupId: exceptGroupId ? Not(exceptGroupId) : undefined },
      order: { createdAt: 'ASC' },
      relations: { group: true },
    });

    if (!defaultGroupToUser) {
      throw new Error('Default group for this user does not exist. This should not have happened.');
    }

    return defaultGroupToUser.group;
  }

  async resetDefaultGroup(userId: number, exceptGroupId?: number) {
    const defaultGroup = await this.getDefaultGroup(userId, exceptGroupId);

    return this.usersService.updateDefaultGroup(userId, defaultGroup.id);
  }

  async getAllForUser(userId: number) {
    const userToGroups = await this.userToGroupsRepository.findBy({ userId });
    const groupIds = userToGroups.map((utg) => utg.groupId);

    return await this.groupsRepository.find({
      where: { id: In(groupIds) },
      relations: { userToGroups: { user: true } },
    });
  }

  async create(userId: number, body: CreateGroupDto) {
    const group = this.groupsRepository.create(body);
    const userToGroup = this.userToGroupsRepository.create({
      userId,
      role: UserInGroupRole.OWNER,
    });
    group.userToGroups = [userToGroup];
    return this.groupsRepository.save(group);
  }

  async invite(userId: number, groupId: number, email: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new BadRequestException({ email: ['User with this email was not found'] });
    }

    const isOwner = await this.userIsOwnerOfGroup(userId, groupId);

    if (!isOwner) {
      throw new UnauthorizedException('You cannot invite users to this group');
    }

    const userInGroup = await this.userToGroupsRepository.count({ where: { userId: user.id, groupId } });

    if (userInGroup > 0) {
      throw new BadRequestException({ email: ['This user is already in this group!'] });
    }

    const userToGroup = this.userToGroupsRepository.create({
      userId: user.id,
      groupId,
      role: UserInGroupRole.MEMBER,
    });

    return await this.userToGroupsRepository.save(userToGroup);
  }

  async revoke(userId: number, groupId: number, revokedUserId: number) {
    const revokedUser = await this.usersService.findById(revokedUserId);

    if (!revokedUser) {
      throw new NotFoundException('This user does not exist anymore');
    }

    const userToGroups = await this.userToGroupsRepository.find({
      where: { groupId },
      relations: { user: true },
    });
    const owner = userToGroups.find((utg) => utg.role === UserInGroupRole.OWNER);

    if (!owner) {
      throw new NotFoundException('Group does not exist');
    }

    if (owner.userId === revokedUserId) {
      throw new UnauthorizedException('You cannot revoke yourself as owner from this group');
    } else if (owner.userId !== userId) {
      throw new UnauthorizedException('You cannot revoke users from this group');
    }

    const revokedUserToGroup = userToGroups.find((utg) => utg.userId === revokedUserId);

    if (!revokedUserToGroup) {
      throw new NotFoundException('This user does not belong to this group');
    }

    return await this.userToGroupsRepository.remove(revokedUserToGroup);
  }

  async edit(userId: number, groupId: number, data: EditGroupDto) {
    const group = await this.groupsRepository.findOneBy({ id: groupId });

    if (!group) {
      throw new NotFoundException('This group does not exist');
    }

    const isOwner = await this.userIsOwnerOfGroup(userId, groupId);

    if (!isOwner) {
      throw new UnauthorizedException('You cannot edit this group');
    }

    group.name = data.name;

    return this.groupsRepository.save(group);
  }

  async remove(userId: number, groupId: number) {
    const group = await this.groupsRepository.findOne({
      where: { id: groupId },
      relations: { userToGroups: { user: true } },
    });

    if (!group) {
      throw new NotFoundException('This group does not exist');
    }

    const groupUsers = group.userToGroups.map((utg) => utg.user);

    const owner = group.userToGroups.find((utg) => utg.role === UserInGroupRole.OWNER);

    if (!owner || owner.userId !== userId) {
      throw new UnauthorizedException('You cannot delete this group');
    }

    const groupsOwnedByUser = await this.userToGroupsRepository.findBy({ userId, role: UserInGroupRole.OWNER });

    if (groupsOwnedByUser.length === 1) {
      throw new UnauthorizedException('You cannot delete the last group that you own');
    }

    for (const user of groupUsers) {
      if (user.defaultGroupId === groupId) {
        await this.resetDefaultGroup(userId, groupId);
      }
    }

    await this.groupsRepository.remove(group);
  }

  async switch(userId: number, groupId: number) {
    const group = await this.groupsRepository.findOne({
      where: { id: groupId },
      relations: { userToGroups: { user: true } },
    });

    if (!group) {
      throw new NotFoundException('This group does not exist');
    }

    const groupUsers = group.userToGroups.map((utg) => utg.user);

    const userInGroup = groupUsers.find((user) => user.id === userId);

    if (!userInGroup) {
      throw new UnauthorizedException('You cannot switch to this group');
    }

    await this.usersService.updateDefaultGroup(userId, groupId);
  }

  async leave(userId: number, groupId: number) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException('This user does not exist');
    }

    const userToGroup = await this.userToGroupsRepository.findOneBy({ userId, groupId });

    if (!userToGroup) {
      throw new NotFoundException('Either the group does not exist, or this user is not in this group');
    }

    if (userToGroup.role === UserInGroupRole.OWNER) {
      throw new UnauthorizedException('Owner cannot leave own group');
    }

    if (user.defaultGroupId === groupId) {
      await this.resetDefaultGroup(userId, groupId);
    }

    return await this.userToGroupsRepository.remove(userToGroup);
  }

  async transferOwnership(currentOwnerId: number, transferData: GroupOwnershipTransferDto) {
    const currentOwnerToGroup = await this.userToGroupsRepository.findOne({
      where: { groupId: transferData.groupId, userId: currentOwnerId, role: UserInGroupRole.OWNER },
    });

    if (!currentOwnerToGroup) {
      throw new UnauthorizedException('Current user is not the owner of this group');
    }

    const newOwnerToGroup = await this.userToGroupsRepository.findOne({
      where: { groupId: transferData.groupId, userId: transferData.newOwnerId },
    });

    if (!newOwnerToGroup) {
      throw new BadRequestException('New owner is not a member of this group');
    }

    currentOwnerToGroup.role = UserInGroupRole.MEMBER;
    newOwnerToGroup.role = UserInGroupRole.OWNER;

    await this.userToGroupsRepository.save([currentOwnerToGroup, newOwnerToGroup]);
  }

  async findGroupsWhereUserIsOwner(userId: number) {
    const userToGroups = await this.userToGroupsRepository.find({
      where: { userId, role: UserInGroupRole.OWNER },
      relations: { group: { userToGroups: true } },
    });

    return userToGroups.map((utg) => utg.group);
  }

  async removeGroupsByIds(groupIds: number[]) {
    await this.groupsRepository.delete({ id: In(groupIds) });
  }
}
