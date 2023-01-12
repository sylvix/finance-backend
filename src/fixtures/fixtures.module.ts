import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { FixturesService } from './fixtures.service';
import { SeedCommand } from './seed.command';

@Module({
  imports: [UsersModule],
  providers: [FixturesService, SeedCommand],
})
export class FixturesModule {}
