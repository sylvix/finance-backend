import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer, ValidationError } from 'class-validator';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';

interface CustomValidationError {
  [key: string]: string[];
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const config = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
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
      .addBearerAuth(undefined, 'access-token')
      .addBearerAuth(undefined, 'refresh-token')
      .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api/swagger', app, document);

    app.useStaticAssets(config.get<string>('MEDIA_DEST') || 'public');

    app.enableCors({
      origin: ['http://127.0.0.1:5173', 'http://localhost:5173'],
      credentials: true,
    });
  }

  const port = parseInt(config.get('PORT', '8000'));

  await app.listen(port);
}

void bootstrap();
