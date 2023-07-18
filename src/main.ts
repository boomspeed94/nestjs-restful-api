import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
dotenv.config({ path: `.env.${process.env.APP_ENV}` });
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
// JSON.stringify() doesn't know how to serialize a BigInt
// https://github.com/GoogleChromeLabs/jsbi/issues/30
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

async function bootstrap() {
  const appOptions = { cors: true };
  const app = await NestFactory.create(AppModule, appOptions);
  app.setGlobalPrefix('api/v1');

  // swagger documentation
  const options = new DocumentBuilder()
    .setTitle('NestJS RestFul App')
    .setDescription('The API description!!!')
    .setVersion('1.0')
    .addBearerAuth()
    .setExternalDoc('Postman Collection', '/docs-json')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('/docs', app, document);

  await app.listen(process.env.PORT);
}
bootstrap();
