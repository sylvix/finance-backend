import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '../users/user.entity';
import { UserSubscriber } from '../users/user.subscriber';
import migrations from './migrations';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): DataSourceOptions => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: parseInt(configService.get('DB_PORT') as string),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASS'),
        database: configService.get('DB_NAME'),
        entities: [User],
        subscribers: [UserSubscriber],
        synchronize: false,
        migrations,
      }),
      dataSourceFactory: async (options) => {
        return new DataSource(options as DataSourceOptions).initialize();
      },
    }),
  ],
})
export class DatabaseModule {}
