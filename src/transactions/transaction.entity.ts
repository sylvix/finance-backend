import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Group } from '../groups/group.entity';
import { Account } from '../accounts/account.entity';
import { ApiHideProperty } from '@nestjs/swagger';

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

  @ApiHideProperty()
  @ManyToOne(() => Group, (group) => group.transactions, { onDelete: 'CASCADE' })
  group: Group;

  @Column({ nullable: true })
  incomingAccountId: number | null;

  @ManyToOne(() => Account, { nullable: true, onDelete: 'CASCADE' })
  incomingAccount: Account;

  @Column({ nullable: true })
  outgoingAccountId: number | null;

  @ManyToOne(() => Account, { nullable: true, onDelete: 'CASCADE' })
  outgoingAccount: Account;

  @Column({ type: 'bigint', nullable: true })
  incomingAmount: number | null;

  @Column({ type: 'bigint', nullable: true })
  outgoingAmount: number | null;

  @Column()
  description?: string;
}
