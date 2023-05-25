import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Group } from '../groups/group.entity';
import { Account } from '../accounts/account.entity';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp with time zone' })
  conductedAt: Date;

  @Column()
  groupId: number;

  @ManyToOne(() => Group, (group) => group.transactions, { onDelete: 'CASCADE' })
  group: Group;

  @Column()
  incomingAccountId: number;

  @ManyToOne(() => Account, { nullable: true, onDelete: 'CASCADE' })
  incomingAccount: Account;

  @Column()
  outgoingAccountId: number;

  @ManyToOne(() => Account, { nullable: true, onDelete: 'CASCADE' })
  outgoingAccount: Account;

  @Column({ type: 'bigint', nullable: true })
  incomingAmount: number;

  @Column({ type: 'bigint', nullable: true })
  outgoingAmount: number;

  @Column()
  description: string;
}
