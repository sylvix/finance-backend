import { join } from 'path';
import { promises as fs } from 'fs';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { EditProfileDto } from './dto/editProfile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async create(email: string, password: string, displayName: string): Promise<User> {
    const user = this.usersRepository.create({
      email,
      password,
      displayName,
    });

    return this.usersRepository.save(user);
  }

  async editProfile(user: User, body: EditProfileDto, avatar: Express.Multer.File) {
    if (body.email) {
      user.email = body.email;
    }

    if (body.displayName) {
      user.displayName = body.displayName;
    }

    if (avatar) {
      await this.removeAvatar(user.avatar);
      user.avatar = avatar.filename;
    }

    return this.usersRepository.save(user);
  }

  async updatePassword(user: User, newPassword: string) {
    user.password = newPassword;
    return this.usersRepository.save(user);
  }

  private async removeAvatar(filename: string) {
    try {
      const basePath = this.configService.get('MEDIA_DEST');
      await fs.unlink(join(basePath, filename));
    } catch {}
  }
}
