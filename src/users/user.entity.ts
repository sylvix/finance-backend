import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
import { UserToken } from './userToken.entity';
import { ApiHideProperty } from '@nestjs/swagger';

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

  @Exclude()
  @ApiHideProperty()
  @OneToMany(() => UserToken, (userToken) => userToken.user)
  tokens: UserToken[];

  async validatePassword(password: string) {
    return bcrypt.compare(password, this.password);
  }
}
