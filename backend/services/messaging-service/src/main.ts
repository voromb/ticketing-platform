import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS Configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true,
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global Prefix
  app.setGlobalPrefix('api');

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Messaging Service API')
    // cSpell:disable-next-line
    .setDescription(
      'Sistema de mensajería interna y notificaciones para Ticketing Platform',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addServer('http://localhost:3005', 'Development Server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3005;
  await app.listen(port);

  console.log(`🚀 Messaging Service running on http://localhost:${port}`);
  console.log(
    `📚 Swagger documentation available at http://localhost:${port}/api/docs`,
  );
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start Messaging Service:', error);
  process.exit(1);
});
