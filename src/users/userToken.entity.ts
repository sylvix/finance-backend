import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { ApiHideProperty } from '@nestjs/swagger';
import { User } from './user.entity';

@Entity()
export class UserToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Exclude()
  @ApiHideProperty()
  @ManyToOne(() => User, (user) => user.tokens, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'timestamp with time zone' })
  expiresAt: Date;

  @Column()
  clientName: string;

  @Column()
  osName: string;

  @Column()
  deviceType: string;

  @Column()
  deviceBrand: string;

  @Column()
  deviceModel: string;
}
