import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefijo global para todas las rutas
  app.setGlobalPrefix('api');

  // CORS para el frontend
  app.enableCors({
    origin: [
      'http://localhost:4200',
      'http://localhost:4201',
      'http://localhost:4202',
    ],
    credentials: true,
  });

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Festival Services API')
    .setDescription(
      'API para servicios del festival: viajes, restaurantes y merchandising',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('travel', 'Gestión de viajes')
    .addTag('restaurant', 'Gestión de restaurantes')
    .addTag('merchandising', 'Gestión de productos')
    .addTag('approval', 'Sistema de aprobaciones')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Festival Services corriendo en: http://localhost:${port}`);
  console.log(`📚 Documentación en: http://localhost:${port}/api/docs`);
}
bootstrap();
