import fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { PrismaClient } from '@prisma/client';
import { authRoutes } from './routes/auth.routes';
import { eventRoutes } from './routes/event.routes';
import { venueRoutes } from './routes/venue.routes';
import { adminRoutes } from './routes/admin.routes';
import { auditRoutes } from './routes/audit.routes';
import ENV from './config/env';
import pino from 'pino';
import { RabbitMQService } from './services/rabbitmq.service';
import { registerAuditMiddleware, auditContextMiddleware } from './middlewares/audit.middleware';

// Crear logger
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore: 'pid,hostname',
      translateTime: 'SYS:standard'
    }
  }
});

// Extender FastifyRequest
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      email: string;
      role: string;
    };
  }
}

export async function buildServer(): Promise<FastifyInstance> {
  const server = fastify({
    logger: false
  });

  // Inicializar servicios
  const prisma = new PrismaClient();
  registerAuditMiddleware(prisma);
  
  const rabbitmq = new RabbitMQService();

  try {
    await rabbitmq.connect();
    logger.info('RabbitMQ conectado (mock)');
  } catch (error) {
    logger.warn('WARNING: RabbitMQ no disponible, continuando sin él');
  }

  // Registrar plugins
  await server.register(cors, {
    origin: true,
    credentials: true,
  });

  await server.register(jwt, {
    secret: ENV.JWT_SECRET,
  });

  // Decoradores
  server.decorate('prisma', prisma);
  server.decorate('rabbitmq', rabbitmq);

  // Hooks globales
  server.addHook('onRequest', async (request, reply) => {
    logger.info(`${request.method} ${request.url}`);
  });

  // Hook para contexto de auditoría en rutas autenticadas
  server.addHook('preHandler', async (request, reply) => {
    if (request.user) {
      await auditContextMiddleware(request, reply);
    }
  });

  // Manejo de errores
  server.setErrorHandler((error, request, reply) => {
    logger.error(`Error: ${error.message}`);
    reply.status(error.statusCode || 500).send({
      error: error.message || 'Internal Server Error'
    });
  });

  try {
    await server.register(authRoutes, { prefix: '/api/auth' });
    await server.register(eventRoutes, { prefix: '/api/events' });
    await server.register(venueRoutes, { prefix: '/api/venues' });
    await server.register(adminRoutes, { prefix: '/api/admins' });
    await server.register(auditRoutes, { prefix: '/api/audit' });
  } catch (error) {
    logger.error('Error registrando rutas:', error);
  }
  server.get('/health', async (request, reply) => {
    const dbHealthy = await prisma.$queryRaw`SELECT 1`
      .then(() => true)
      .catch(() => false);

    return reply.send({
      status: dbHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      database: dbHealthy ? 'connected' : 'disconnected',
      rabbitmq: rabbitmq.isConnected() ? 'connected' : 'disconnected'
    });
  });

  // Ruta raíz
  server.get('/', async (request, reply) => {
    return {
      name: 'Ticketing Admin API',
      version: '1.0.0',
      endpoints: {
        auth: '/api/auth',
        events: '/api/events',
        venues: '/api/venues',
        admins: '/api/admins',
        audit: '/api/audit',
        health: '/health'
      }
    };
  });

  // Hook de cierre
  server.addHook('onClose', async () => {
    await prisma.$disconnect();
    await rabbitmq.close();
    logger.info('Conexiones cerradas');
  });

  return server;
}

export async function startServer() {
  try {
    const server = await buildServer();
    
    await server.listen({
      port: ENV.PORT,
      host: '0.0.0.0',
    });

    console.log(`
    ╔════════════════════════════════════════════╗
    ║                                            ║
    ║   Ticketing Admin API v1.0.0               ║
    ║                                            ║
    ║   Servidor corriendo en:                   ║
    ║   http://localhost:${ENV.PORT}             ║
    ║                                            ║
    ║   Health Check:                            ║
    ║   http://localhost:${ENV.PORT}/health      ║
    ║                                            ║
    ╚════════════════════════════════════════════╝
    `);
    
    logger.info(`Servidor iniciado en puerto ${ENV.PORT}`);
    
    return server;
  } catch (error) {
    console.error('ERROR iniciando servidor:', error);
    process.exit(1);
  }
}


