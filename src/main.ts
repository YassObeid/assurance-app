import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Validation globale des DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ✅ Config Swagger (OpenAPI)
  const config = new DocumentBuilder()
    .setTitle('Assurance API')
    .setDescription(
      'API de gestion des régions, managers, délégués, membres et paiements.',
    )
    .setVersion('1.0.0')
    .addBearerAuth() // pour tester les routes protégées avec un JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document); // => http://localhost:3000/docs

  await app.listen(3000);
  console.log('API running on http://localhost:3000');
  console.log('Swagger docs on http://localhost:3000/docs');
}
bootstrap();
