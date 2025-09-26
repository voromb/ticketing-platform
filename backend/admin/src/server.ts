import fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { PrismaClient } from '@prisma/client';
import { authRoutes } from './routes/auth.routes';
import { eventRoutes } from './routes/event.routes';
import { venueRoutes } from './routes/venue.routes';
import { adminRoutes } from './routes/admin.routes';
import { auditRoutes } from './routes/audit.routes';
import { ENV } from './config/env';
import logger from './utils/logger';
import { RabbitMQService } from './services/rabbitmq.service';
import { registerAuditMiddleware, auditContextMiddleware } from './middlewares/audit.middleware';

// Extender la interfaz FastifyRequest para incluir el usuario
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
        logger: false, // Usamos nuestro propio logger
        requestIdLogLabel: 'requestId',
        genReqId: () => Math.random().toString(36).substr(2, 9),
    });

    // Inicializar Prisma
    const prisma = new PrismaClient({
        log: ENV.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });

    // Registrar middleware de auditoría en Prisma
    registerAuditMiddleware(prisma);

    // Inicializar RabbitMQ
    const rabbitmq = new RabbitMQService();

    try {
        await rabbitmq.connect();
        logger.info('✅ RabbitMQ conectado');
    } catch (error) {
        logger.error('❌ Error conectando RabbitMQ:', error);
    }

    // Registrar plugins
    await server.register(cors, {
        origin: true,
        credentials: true,
    });

    await server.register(jwt, {
        secret: ENV.JWT_SECRET,
    });

    // Configurar Swagger para documentación
    await server.register(swagger, {
        swagger: {
            info: {
                title: 'Ticketing Admin API',
                description: 'API de administración para plataforma de ticketing',
                version: '1.0.0',
            },
            host: `localhost:${ENV.PORT}`,
            schemes: ['http'],
            consumes: ['application/json'],
            produces: ['application/json'],
            tags: [
                { name: 'Auth', description: 'Autenticación y autorización' },
                { name: 'Events', description: 'Gestión de eventos' },
                { name: 'Venues', description: 'Gestión de venues' },
                { name: 'Admins', description: 'Gestión de administradores' },
                { name: 'Audit', description: 'Logs de auditoría' },
            ],
            securityDefinitions: {
                Bearer: {
                    type: 'apiKey',
                    name: 'Authorization',
                    in: 'header',
                    description:
                        'JWT Authorization header using the Bearer scheme. Example: "Bearer {token}"',
                },
            },
            security: [{ Bearer: [] }],
        },
    });

    await server.register(swaggerUi, {
        routePrefix: '/docs',
        uiConfig: {
            docExpansion: 'list',
            deepLinking: false,
        },
        staticCSP: true,
        transformStaticCSP: header => header,
    });

    // Decoradores para compartir instancias
    server.decorate('prisma', prisma);
    server.decorate('rabbitmq', rabbitmq);

    // Hook global para logging de requests
    server.addHook('onRequest', async (request, reply) => {
        logger.info({
            method: request.method,
            url: request.url,
            ip: request.ip,
            requestId: request.id,
        });
    });

    // Hook para establecer contexto de auditoría en rutas autenticadas
    server.addHook('preHandler', async (request, reply) => {
        // Solo para rutas autenticadas (que tienen user)
        if (request.user) {
            await auditContextMiddleware(request, reply);
        }
    });

    // Hook para logging de respuestas
    server.addHook('onResponse', async (request, reply) => {
        logger.info({
            requestId: request.id,
            statusCode: reply.statusCode,
            responseTime: reply.getResponseTime(),
        });
    });

    // Hook para manejo de errores
    server.setErrorHandler((error, request, reply) => {
        logger.error({
            error: error.message,
            stack: error.stack,
            url: request.url,
            method: request.method,
            requestId: request.id,
        });

        if (error.validation) {
            reply.status(400).send({
                error: 'Validation Error',
                message: error.message,
                requestId: request.id,
            });
        } else {
            reply.status(error.statusCode || 500).send({
                error: error.message || 'Internal Server Error',
                requestId: request.id,
            });
        }
    });

    // Registrar rutas
    await server.register(authRoutes, { prefix: '/api/auth' });
    await server.register(eventRoutes, { prefix: '/api/events' });
    await server.register(venueRoutes, { prefix: '/api/venues' });
    await server.register(adminRoutes, { prefix: '/api/admins' });
    await server.register(auditRoutes, { prefix: '/api/audit' });

    // Ruta de health check mejorada
    server.get('/health', async (request, reply) => {
        const checks = {
            database: false,
            rabbitmq: false,
            redis: false, // Para futuro uso
        };

        // Check database
        try {
            await prisma.$queryRaw`SELECT 1`;
            checks.database = true;
        } catch (error) {
            logger.error('Database health check failed:', error);
        }

        // Check RabbitMQ
        checks.rabbitmq = rabbitmq.isConnected();

        const allHealthy = Object.values(checks).every(v => v === true);
        const statusCode = allHealthy ? 200 : 503;

        return reply.status(statusCode).send({
            status: allHealthy ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            services: checks,
            environment: ENV.NODE_ENV,
        });
    });

    // Ruta de métricas
    server.get('/metrics', async (request, reply) => {
        const [eventCount, venueCount, adminCount, auditCount] = await Promise.all([
            prisma.event.count(),
            prisma.venue.count(),
            prisma.admin.count(),
            prisma.auditLog.count(),
        ]);

        return reply.send({
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            counts: {
                events: eventCount,
                venues: venueCount,
                admins: adminCount,
                auditLogs: auditCount,
            },
        });
    });

    // Ruta raíz
    server.get('/', async (request, reply) => {
        return {
            name: 'Ticketing Admin API',
            version: '1.0.0',
            environment: ENV.NODE_ENV,
            docs: `http://localhost:${ENV.PORT}/docs`,
            health: `http://localhost:${ENV.PORT}/health`,
            metrics: `http://localhost:${ENV.PORT}/metrics`,
            endpoints: {
                auth: '/api/auth',
                events: '/api/events',
                venues: '/api/venues',
                admins: '/api/admins',
                audit: '/api/audit',
            },
        };
    });

    // Hook para cerrar conexiones al apagar el servidor
    server.addHook('onClose', async () => {
        await prisma.$disconnect();
        await rabbitmq.close();
        logger.info('✅ Conexiones cerradas correctamente');
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

        logger.info(`
    ╔════════════════════════════════════════════════╗
    ║                                                ║
    ║   🚀 Ticketing Admin API v1.0.0               ║
    ║                                                ║
    ║   Servidor corriendo en:                       ║
    ║   http://localhost:${ENV.PORT}                 ║
    ║                                                ║
    ║   📚 Documentación:                            ║
    ║   http://localhost:${ENV.PORT}/docs            ║
    ║                                                ║
    ║   🏥 Health Check:                             ║
    ║   http://localhost:${ENV.PORT}/health          ║
    ║                                                ║
    ╚════════════════════════════════════════════════╝
    `);

        return server;
    } catch (error) {
        logger.error('❌ Error iniciando el servidor:', error);
        process.exit(1);
    }
}
