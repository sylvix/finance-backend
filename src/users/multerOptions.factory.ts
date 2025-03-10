import { extname, join } from 'path';
import { promises as fs } from 'fs';
import { randomUUID } from 'crypto';
import { diskStorage } from 'multer';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export const multerOptionsFactory = (configService: ConfigService): MulterOptions => ({
  fileFilter: (req, file, cb) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
      cb(null, true);
    } else {
      cb(new HttpException(`Unsupported file type ${extname(file.originalname)}`, HttpStatus.BAD_REQUEST), false);
    }
  },
  storage: diskStorage({
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    destination: async (req, file, cb) => {
      const dest = configService.get<string>('MEDIA_DEST');

      if (!dest) {
        return cb(new HttpException('Media destination not provided', HttpStatus.INTERNAL_SERVER_ERROR), '/dev/null');
      }

      const uploadPath = join(dest, 'avatars');

      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, dest);
    },
    filename: (req, file, cb) => {
      cb(null, join('avatars', `${randomUUID()}${extname(file.originalname)}`));
    },
  }),
});
