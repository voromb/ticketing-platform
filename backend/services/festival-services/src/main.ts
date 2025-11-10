import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './auth/interceptors/logging.interceptor';
import { AuditInterceptor } from './auth/interceptors/audit.interceptor';
import { PerformanceInterceptor } from './auth/interceptors/performance.interceptor';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import compression from 'compression';
import { Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

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

  // Health check endpoint
  app.getHttpAdapter().get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', service: 'festival-services' });
  });

  // Configuración global
  app.enableCors();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Interceptors globales para logging y auditoría
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new AuditInterceptor(),
    new PerformanceInterceptor(),
  );

  // Servir archivos estáticos (imágenes subidas)
  // __dirname en producción apunta a dist/src, necesitamos subir 2 niveles
  const uploadsPath = join(process.cwd(), 'uploads');
  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads/',
  });
  console.log('📁 Sirviendo archivos estáticos desde:', uploadsPath);

  // Configurar puerto
  const port = 3004; // Forzado a 3004

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Festival Services API')
    .setDescription('Backend para servicios del festival: Travel, Restaurant, Merchandising y Approvals')
    .setVersion('1.0')
    .addServer(`http://localhost:${port}`, 'Servidor de desarrollo')
    .addTag('auth', 'Autenticación y autorización')
    .addTag('travel', 'Gestión de viajes')
    .addTag('restaurant', 'Gestión de restaurantes')
    .addTag('merchandising', 'Gestión de productos')
    .addTag('approval', 'Sistema de aprobaciones')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Conectar microservicio RabbitMQ
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue: process.env.RABBITMQ_QUEUE_APPROVAL_REQUESTS || 'approval_requests',
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.startAllMicroservices();
  console.log('🐰 RabbitMQ conectado');
  await app.listen(port);
  
  console.log(`[SERVER] Festival Services: http://localhost:${port}`);
  console.log(`[DOCS] Documentación: http://localhost:${port}/api/docs`);
}

bootstrap();