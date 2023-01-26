import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());

  if (process.env.NODE_ENV !== 'production') {
    const options = new DocumentBuilder()
      .setTitle('Finance Tracker API')
      .setDescription('Finance Tracker API documentation')
      .setVersion('1.0')
      .addTag('auth', 'Authentication and logout flow')
      .addCookieAuth('AccessToken', undefined, 'access-token')
      .addCookieAuth('RefreshToken', undefined, 'refresh-token')
      .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api/swagger', app, document, {
      swaggerOptions: {
        supportedSubmitMethods: [],
      },
    });
  }

  await app.listen(8000);
}

void bootstrap();
