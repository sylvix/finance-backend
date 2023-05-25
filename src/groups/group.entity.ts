import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserToGroup } from './userToGroup.entity';
import { Account } from '../accounts/account.entity';
import { Transaction } from '../transactions/transaction.entity';

@Entity()
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => UserToGroup, (userToGroup) => userToGroup.group, { cascade: true })
  userToGroups: UserToGroup[];

  @OneToMany(() => Account, (account) => account.group, { cascade: true })
  accounts: Account[];

  @OneToMany(() => Transaction, (transaction) => transaction.group, { cascade: true })
  transactions: Transaction[];

  @CreateDateColumn()
  createdAt: Date;
}
