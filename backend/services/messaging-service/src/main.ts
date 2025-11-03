import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar compresión Brotli/Gzip
  app.use(compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
    threshold: 1024, // Solo comprimir respuestas > 1KB
  }));

  // Conectar microservicio RabbitMQ
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue: 'approval_requests',
      noAck: false,
      queueOptions: {
        durable: true,
      },
    },
  });
  
  console.log('🔧 Configurando microservicio RabbitMQ...');

  // CORS Configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true,
    exposedHeaders: ['X-User-Id', 'X-User-Name', 'X-User-Type'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Id', 'X-User-Name', 'X-User-Type'],
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

  // Iniciar microservicio
  await app.startAllMicroservices();
  console.log('🐰 RabbitMQ Microservice started');

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
