import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserToGroup } from './userToGroup.entity';

@Entity()
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => UserToGroup, (userToGroup) => userToGroup.group, { cascade: true })
  userToGroups: UserToGroup[];

  @CreateDateColumn()
  createdAt: Date;
}
