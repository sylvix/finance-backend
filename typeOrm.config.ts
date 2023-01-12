import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { DatabaseModule } from './src/database/database.module';

async function createDataSource(): Promise<DataSource> {
  const app = await NestFactory.create(DatabaseModule);
  const dataSource = app.select(DatabaseModule).get(DataSource);
  await dataSource.destroy();

  return dataSource;
}

export default createDataSource();
