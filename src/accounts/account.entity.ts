import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Group } from '../groups/group.entity';

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

  @ManyToOne(() => Group, (group) => group.accounts, { onDelete: 'CASCADE' })
  group: Group;

  @Column()
  name: string;

  @Column({ type: 'varchar', length: 4 })
  currency: string;

  @Column({ type: 'enum', enum: AccountType })
  type: string;

  @CreateDateColumn()
  createdAt: Date;
}
