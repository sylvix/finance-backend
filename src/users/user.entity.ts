import * as bcrypt from 'bcrypt';
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import { UserToken } from './userToken.entity';
import { ApiHideProperty } from '@nestjs/swagger';
import { UserToGroup } from '../groups/userToGroup.entity';
import { Group } from '../groups/group.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @ApiHideProperty()
  @Column()
  password: string;

  @Column()
  displayName: string;

  @Column({ nullable: true })
  avatar: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @Expose({ groups: ['user'] })
  defaultGroupId: number;

  @ApiHideProperty()
  @ManyToOne(() => Group)
  defaultGroup: Group;

  @Exclude()
  @ApiHideProperty()
  @OneToMany(() => UserToken, (userToken) => userToken.user)
  tokens: UserToken[];

  @Exclude()
  @ApiHideProperty()
  @OneToMany(() => UserToGroup, (userToGroup) => userToGroup.user, { cascade: true })
  userToGroups: UserToGroup[];

  async validatePassword(password: string) {
    return bcrypt.compare(password, this.password);
  }
}
