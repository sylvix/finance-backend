import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import migrations from './migrations';
import { UserSubscriber } from '../users/user.subscriber';
import { User } from '../users/user.entity';
import { UserToGroup } from '../groups/userToGroup.entity';
import { UserToken } from '../users/userToken.entity';
import { Group } from '../groups/group.entity';
import { Account } from '../accounts/account.entity';
import { Transaction } from '../transactions/transaction.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: parseInt(configService.get('DB_PORT') as string),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASS'),
        database: configService.get('DB_NAME'),
        entities: [User, UserToGroup, UserToken, Group, Account, Transaction],
        subscribers: [UserSubscriber],
        synchronize: false,
        logging: Boolean(configService.get('DB_LOGGER')),
        migrations,
      }),
      dataSourceFactory: async (options) => {
        return new DataSource(options as DataSourceOptions).initialize();
      },
    }),
  ],
})
export class DatabaseModule {}
