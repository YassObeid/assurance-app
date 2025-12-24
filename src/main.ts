import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Security: Helmet for security headers
  app.use(helmet());

  // ✅ Security: CORS configuration
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001', // Frontend URL
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

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

  await app.listen(process.env.PORT || 3000);
  console.log(`API running on http://localhost:${process.env.PORT || 3000}`);
  console.log(`Swagger docs on http://localhost:${process.env.PORT || 3000}/docs`);
}
bootstrap();
