import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { config } from './config';
import { seed } from './utils';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const PORT = config.APP.PORT;
  const DB = config.DB.database;

  app.use(cookieParser());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('crm')
    .setDescription('REST API')
    .setVersion('1.0.0')
    .addTag('crm')
    .addCookieAuth('Authorization')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('/api/docs', app, document);

  await app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server started on port = ${PORT}`);
    // eslint-disable-next-line no-console
    console.log(`Server connected to ${DB}`);

    seed();
  });
}

bootstrap();
