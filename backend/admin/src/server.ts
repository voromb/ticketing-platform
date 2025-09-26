import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { PrismaClient } from '@prisma/client';
import { config } from './config/env';
import { authRoutes } from './routes/auth.routes';
import { RabbitMQService } from './services/rabbitmq.service';
import { logger } from './utils/logger';

declare module 'fastify' {
    interface FastifyInstance {
        prisma: PrismaClient;
        rabbitmq: RabbitMQService;
    }
    interface FastifyRequest {
        user?: {
            id: string;
            email: string;
            role: string;
        };
    }
}

export async function buildServer(): Promise<FastifyInstance> {
    const server = Fastify({
        logger: false,
    });

    // Initialize Prisma
    const prisma = new PrismaClient();

    // Initialize RabbitMQ
    const rabbitmq = new RabbitMQService(config.RABBITMQ_URL);

    // Decorators
    server.decorate('prisma', prisma);
    server.decorate('rabbitmq', rabbitmq);

    // Plugins
    await server.register(cors, {
        origin: config.CORS_ORIGIN,
        credentials: true,
    });

    await server.register(jwt, {
        secret: config.JWT_SECRET,
    });

    // Health check
    server.get('/health', async () => {
        return {
            status: 'healthy',
            timestamp: new Date().toISOString(),
        };
    });

    // Routes
    await server.register(authRoutes, { prefix: '/api/v1/auth' });

    // Connect to RabbitMQ
    await rabbitmq.connect();

    // Cleanup on close
    server.addHook('onClose', async () => {
        await prisma.$disconnect();
        await rabbitmq.close();
    });

    return server;
}

export async function start() {
    try {
        const server = await buildServer();

        await server.listen({
            port: config.PORT,
            host: config.HOST,
        });

        logger.info(`🚀 Admin Server running at http://localhost:${config.PORT}`);
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}
