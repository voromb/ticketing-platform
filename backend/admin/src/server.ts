import fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import pino from 'pino';

// Routes
import { authRoutes } from './routes/auth.routes';
import { eventRoutes } from './routes/event.routes';
import { venueRoutes } from './routes/venue.routes';
import { adminRoutes } from './routes/admin.routes';
import { auditRoutes } from './routes/audit.routes';
import { userManagementRoutes } from './routes/user-management.routes';
import { categoryRoutes } from './routes/category.routes';
import { reservationRoutes } from './routes/reservation.routes';
import { orderRoutes } from './routes/order.routes';
import { paymentRoutes } from './routes/payment.routes';
import { imageUploadRoutes } from './routes/image-upload.routes';
import { companyRoutes } from './routes/company.routes';
import { companyAdminRoutes } from './routes/company-admin.routes';

// Services
import { RabbitMQService } from './services/rabbitmq.service';
import { imageUploadService } from './services/image-upload.service';

// Jobs
import { startReservationCron } from './jobs/reservation.cron';

// Config
import ENV from './config/env';

// Middlewares
import { registerAuditMiddleware, auditContextMiddleware } from './middlewares/audit.middleware';

// Crear logger
const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
            ignore: 'pid,hostname',
            translateTime: 'SYS:standard',
        },
    },
});

export async function buildServer(): Promise<FastifyInstance> {
    const server = fastify({
        logger: false,
        bodyLimit: 10485760, // 10MB - Aumentado para permitir archivos grandes
    });

    // Inicializar servicios
    const prisma = new PrismaClient();
    registerAuditMiddleware(prisma);

    // Inicializar RabbitMQ
    const { rabbitmqService } = await import('./services/rabbitmq.service');
    await rabbitmqService.connect();

    // Registrar soporte multipart para upload de archivos
    await server.register(multipart, {
        limits: {
            fieldNameSize: 100,
            fieldSize: 100,
            fields: 10,
            fileSize: 5242880, // 5MB por archivo
            files: 15, // Máximo 15 archivos
            headerPairs: 2000,
        },
    });

    // Registrar CORS
    await server.register(cors, {
        origin: true,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });

    // Registrar JWT
    await server.register(jwt, {
        secret: ENV.JWT_SECRET,
    });

    // Registrar Swagger
    await server.register(swagger, {
        openapi: {
            openapi: '3.0.0',
            info: {
                title: 'Admin Service API',
                description: 'API para el servicio de administración de Ticketing Platform',
                version: '1.0.0',
                contact: {
                    name: 'Ticketing Platform Team',
                    email: 'admin@ticketing.com',
                },
            },
            servers: [
                {
                    url: 'http://localhost:3003',
                    description: 'Servidor de desarrollo',
                },
            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                        description: 'JWT token para autenticación de administradores',
                    },
                },
            },
            tags: [
                { name: 'Authentication', description: 'Autenticación de administradores' },
                { name: 'Events', description: 'Gestión de eventos' },
                { name: 'Venues', description: 'Gestión de venues/locales' },
                { name: 'Categories', description: 'Gestión de categorías' },
                { name: 'Admins', description: 'Gestión de administradores' },
                { name: 'Audit', description: 'Logs de auditoría' },
                { name: 'Users', description: 'Gestión de usuarios' },
                { name: 'Companies', description: 'Gestión de compañías' },
                { name: 'Company Admins', description: 'Gestión de administradores de compañías' },
            ],
        },
    });

    await server.register(swaggerUi, {
        routePrefix: '/api/docs',
        uiConfig: {
            docExpansion: 'list',
            deepLinking: false,
        },
        staticCSP: true,
        transformStaticCSP: header => header,
        transformSpecification: (swaggerObject, request, reply) => {
            return swaggerObject;
        },
        transformSpecificationClone: true,
    });

    // Servir archivos estáticos (imágenes subidas)
    await server.register(fastifyStatic, {
        root: path.join(__dirname, '../uploads'),
        prefix: '/uploads/',
        constraints: {},
    });

    // Inicializar servicio de imágenes
    await imageUploadService.initialize();

    // Decoradores
    server.decorate('prisma', prisma);

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
            error: error.message || 'Internal Server Error',
        });
    });

    try {
        console.log('[INIT] Iniciando registro de rutas...');

        console.log('[REGISTER] Registrando authRoutes...');
        await server.register(authRoutes, { prefix: '/api/auth' });
        console.log('[OK] authRoutes OK');

        console.log('[REGISTER] Registrando eventRoutes...');
        await server.register(eventRoutes, { prefix: '/api/events' });
        console.log('[OK] eventRoutes OK');

        console.log('[REGISTER] Registrando venueRoutes...');
        await server.register(venueRoutes, { prefix: '/api/venues' });
        console.log('[OK] venueRoutes OK');

        console.log('[REGISTER] Registrando adminRoutes...');
        await server.register(adminRoutes, { prefix: '/api/admins' });
        console.log('[OK] adminRoutes OK');

        console.log('[REGISTER] Registrando userManagementRoutes...');
        await server.register(userManagementRoutes, { prefix: '/api/user-management' });
        console.log('[OK] userManagementRoutes OK');

        console.log('[REGISTER] Registrando auditRoutes...');
        await server.register(auditRoutes, { prefix: '/api/audit' });
        console.log('[OK] auditRoutes OK');

        console.log('[REGISTER] Registrando categoryRoutes...');
        await server.register(categoryRoutes, { prefix: '/api/categories' });
        console.log('[OK] categoryRoutes OK');

        console.log('[REGISTER] Registrando reservationRoutes...');
        await server.register(reservationRoutes, { prefix: '/api/reservations' });
        console.log('[OK] reservationRoutes OK');

        console.log('[REGISTER] Registrando orderRoutes...');
        await server.register(orderRoutes, { prefix: '/api/orders' });
        console.log('[OK] orderRoutes OK');

        console.log('[REGISTER] Registrando paymentRoutes...');
        await server.register(paymentRoutes, { prefix: '/api/payments' });
        console.log('[OK] paymentRoutes OK');

        console.log('[REGISTER] Registrando imageUploadRoutes...');
        await server.register(imageUploadRoutes, { prefix: '/api/upload' });
        console.log('[OK] imageUploadRoutes OK');

        console.log('[REGISTER] Registrando companyRoutes...');
        await server.register(companyRoutes, { prefix: '/api' });
        console.log('[OK] companyRoutes OK');

        console.log('[REGISTER] Registrando companyAdminRoutes...');
        await server.register(companyAdminRoutes, { prefix: '/api' });
        console.log('[OK] companyAdminRoutes OK');

        console.log('[SUCCESS] Todas las rutas registradas exitosamente');
    } catch (error: any) {
        logger.error('[ERROR] Error registrando rutas:', error);
        console.error('[ERROR] Error completo:', error);
        console.error('[ERROR] Stack:', error.stack);
    }

    // Health check
    server.get('/health', async (request, reply) => {
        const dbHealthy = await prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false);

        const { rabbitmqService } = await import('./services/rabbitmq.service');

        return reply.send({
            status: dbHealthy ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            database: dbHealthy ? 'connected' : 'disconnected',
            rabbitmq: rabbitmqService.isConnected() ? 'connected' : 'disconnected',
            uploads: 'ready',
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
                userManagement: '/api/user-management',
                audit: '/api/audit',
                categories: '/api/categories',
                reservations: '/api/reservations',
                orders: '/api/orders',
                payments: '/api/payments',
                upload: '/api/upload',
                health: '/health',
            },
        };
    });

    // Hook de cierre
    server.addHook('onClose', async () => {
        await prisma.$disconnect();
        await rabbitmqService.close();
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
    ║   Uploads disponibles en:                  ║
    ║   http://localhost:${ENV.PORT}/api/upload  ║
    ║                                            ║
    ╚════════════════════════════════════════════╝
    `);
    
    logger.info(`Servidor iniciado en puerto ${ENV.PORT}`);
    logger.info(`Servicio de imágenes inicializado`);
    
    // Iniciar cron job de reservas
    startReservationCron();
    
    return server;
  } catch (error) {
    console.error('ERROR iniciando servidor:', error);
    process.exit(1);
  }
}