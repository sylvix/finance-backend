import { promises as fs } from 'fs';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { BadRequestException, NestApplicationOptions, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer, ValidationError } from 'class-validator';

interface CustomValidationError {
  [key: string]: string[];
}

async function bootstrap() {
  const options: NestApplicationOptions = {};

  if (process.env.NODE_ENV !== 'production' && process.env.ENABLE_DEV_HTTPS === 'true') {
    options.httpsOptions = {
      key: await fs.readFile('./certs/cert-dev.key'),
      cert: await fs.readFile('./certs/cert-dev.pem'),
    };
  }

  const app = await NestFactory.create(AppModule, options);
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const errors: CustomValidationError = {};

        validationErrors.forEach((error) => {
          const constraints = error.constraints;

          if (constraints) {
            errors[error.property] = Object.keys(constraints).map((key) => constraints[key]);
          }
        });

        return new BadRequestException(errors);
      },
    }),
  );

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  if (process.env.NODE_ENV !== 'production') {
    const options = new DocumentBuilder()
      .setTitle('Finance Tracker API')
      .setDescription('Finance Tracker API documentation')
      .setVersion('1.0')
      .addTag('auth', 'Authentication and logout flow')
      .addTag('users', 'Users flow')
      .addCookieAuth('AccessToken', undefined, 'access-token')
      .addCookieAuth('RefreshToken', undefined, 'refresh-token')
      .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api/swagger', app, document, {
      swaggerOptions: {
        supportedSubmitMethods: [],
      },
    });

    app.enableCors({
      origin: ['http://127.0.0.1:5173', 'http://localhost:5173'],
      credentials: true,
    });
  }

  await app.listen(8000);
}

void bootstrap();
