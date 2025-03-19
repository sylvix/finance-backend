import { join } from 'path';
import { promises as fs } from 'fs';
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { EditProfileDto } from './dto/editProfile.dto';
import { GroupsService } from '../groups/groups.service';
import { DeleteAccountDto } from './dto/deleteAccount.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly groupsService: GroupsService,
    private readonly configService: ConfigService,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async create(email: string, password: string, displayName: string): Promise<User> {
    const user = this.usersRepository.create({
      email,
      password,
      displayName,
    });

    await this.groupsService.createDefaultGroup(user);

    return this.usersRepository.save(user);
  }

  async editProfile(user: User, body: EditProfileDto, avatar: Express.Multer.File) {
    if (body.email) {
      user.email = body.email;
    }

    if (body.displayName) {
      user.displayName = body.displayName;
    }

    if (avatar) {
      await this.removeAvatar(user.avatar);
      user.avatar = avatar.filename;
    }

    return this.usersRepository.save(user);
  }

  async updatePassword(user: User, newPassword: string) {
    user.password = newPassword;
    return this.usersRepository.save(user);
  }

  private async removeAvatar(filename: string) {
    try {
      const basePath = this.configService.get<string>('MEDIA_DEST') || './public';
      await fs.unlink(join(basePath, filename));
    } catch {
      /* empty */
    }
  }

  async updateDefaultGroup(userId: number, groupId: number) {
    return this.usersRepository.update({ id: userId }, { defaultGroupId: groupId });
  }

  async deleteAccount(user: User, deleteAccountDto: DeleteAccountDto): Promise<void> {
    const ownedGroups = await this.groupsService.findGroupsWhereUserIsOwner(user.id);

    const groupsToDelete: number[] = [];
    const groupsNeedingTransfer = new Set<number>();

    for (const group of ownedGroups) {
      if (group.userToGroups.length === 1) {
        groupsToDelete.push(group.id);
      } else {
        groupsNeedingTransfer.add(group.id);
      }
    }

    const providedTransferGroupIds = new Set(deleteAccountDto.groupTransfers.map((t) => t.groupId));

    const missingTransfers = [...groupsNeedingTransfer].filter((groupId) => !providedTransferGroupIds.has(groupId));
    if (missingTransfers.length > 0) {
      throw new BadRequestException(`Missing ownership transfers for groups: ${missingTransfers.join(', ')}`);
    }

    const unnecessaryTransfers = [...providedTransferGroupIds].filter((groupId) => !groupsNeedingTransfer.has(groupId));
    if (unnecessaryTransfers.length > 0) {
      throw new BadRequestException(`Unnecessary transfers provided for groups: ${unnecessaryTransfers.join(', ')}`);
    }

    for (const transfer of deleteAccountDto.groupTransfers) {
      const group = ownedGroups.find((g) => g.id === transfer.groupId);
      if (!group) {
        throw new BadRequestException(`Group ${transfer.groupId} not found or not owned by user`);
      }
      if (!group.userToGroups.some((utg) => utg.userId === transfer.newOwnerId)) {
        throw new BadRequestException(
          `New owner (${transfer.newOwnerId}) is not a member of group ${transfer.groupId}`,
        );
      }
    }

    await Promise.all(
      deleteAccountDto.groupTransfers.map((transfer) => this.groupsService.transferOwnership(user.id, transfer)),
    );

    if (groupsToDelete.length > 0) {
      await this.groupsService.removeGroupsByIds(groupsToDelete);
    }

    if (user.avatar) {
      await this.removeAvatar(user.avatar);
    }

    // Finally remove the user
    await this.usersRepository.remove(user);
  }
}
