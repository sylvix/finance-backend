import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Group } from './group.entity';
import { Exclude } from 'class-transformer';
import { ApiHideProperty } from '@nestjs/swagger';

export enum UserInGroupRole {
  OWNER = 'owner',
  MEMBER = 'member',
}

@Entity()
export class UserToGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  groupId: number;

  @ManyToOne(() => User, (user) => user.userToGroups, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'enum', enum: UserInGroupRole, default: UserInGroupRole.MEMBER })
  role: UserInGroupRole;

  @CreateDateColumn()
  createdAt: Date;

  @Exclude()
  @ApiHideProperty()
  @ManyToOne(() => Group, (group) => group.userToGroups, { onDelete: 'CASCADE' })
  group: Group;
}
