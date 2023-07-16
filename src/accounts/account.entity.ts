import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Group } from '../groups/group.entity';
import { ApiHideProperty } from '@nestjs/swagger';
import { Transaction } from '../transactions/transaction.entity';

export enum AccountType {
  CASH = 'cash',
  BANK = 'bank',
  OTHER = 'other',
}

@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  groupId: number;

  @ApiHideProperty()
  @ManyToOne(() => Group, (group) => group.accounts, { onDelete: 'CASCADE' })
  group: Group;

  @ApiHideProperty()
  @OneToMany(() => Transaction, (transaction) => transaction.incomingAccount)
  incomingTransactions: Transaction[];

  @ApiHideProperty()
  @OneToMany(() => Transaction, (transaction) => transaction.outgoingAccount)
  outgoingTransactions: Transaction[];

  @Column()
  name: string;

  @Column({ type: 'varchar', length: 4 })
  currency: string;

  @Column({ type: 'enum', enum: AccountType })
  type: AccountType;

  @CreateDateColumn()
  createdAt: Date;
}
