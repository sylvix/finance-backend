import { promises as fs } from 'fs';
import { Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Request } from 'express';

@Catch(HttpException)
export class FileRemovalFilter extends BaseExceptionFilter {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();

    if (request.file) {
      await fs.unlink(request.file.path);
    }

    super.catch(exception, host);
  }
}
