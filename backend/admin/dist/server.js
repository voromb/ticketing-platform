"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildServer = buildServer;
exports.startServer = startServer;
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const client_1 = require("@prisma/client");
const auth_routes_1 = require("./routes/auth.routes");
const event_routes_1 = require("./routes/event.routes");
const venue_routes_1 = require("./routes/venue.routes");
const admin_routes_1 = require("./routes/admin.routes");
const audit_routes_1 = require("./routes/audit.routes");
const user_management_routes_1 = require("./routes/user-management.routes");
const env_1 = __importDefault(require("./config/env"));
const pino_1 = __importDefault(require("pino"));
const audit_middleware_1 = require("./middlewares/audit.middleware");
// Crear logger
const logger = (0, pino_1.default)({
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
// FastifyRequest ya está extendido en auth.middleware.ts
async function buildServer() {
    const server = (0, fastify_1.default)({
        logger: false
    });
    // Inicializar servicios
    const prisma = new client_1.PrismaClient();
    (0, audit_middleware_1.registerAuditMiddleware)(prisma);
    // Inicializar RabbitMQ
    const rabbitmq = {
        isConnected: () => false,
        close: async () => { }
    };
    await server.register(cors_1.default, {
        origin: true,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    });
    await server.register(jwt_1.default, {
        secret: env_1.default.JWT_SECRET,
    });
    // Decoradores
    server.decorate('prisma', prisma);
    // Hooks globales
    server.addHook('onRequest', async (request, reply) => {
        logger.info(`${request.method} ${request.url}`);
    });
    // Hook para contexto de auditoría en rutas autenticadas
    server.addHook('preHandler', async (request, reply) => {
        if (request.user) {
            await (0, audit_middleware_1.auditContextMiddleware)(request, reply);
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
        await server.register(auth_routes_1.authRoutes, { prefix: '/api/auth' });
        await server.register(event_routes_1.eventRoutes, { prefix: '/api/events' });
        await server.register(venue_routes_1.venueRoutes, { prefix: '/api/venues' });
        await server.register(admin_routes_1.adminRoutes, { prefix: '/api/admins' });
        await server.register(user_management_routes_1.userManagementRoutes, { prefix: '/api/user-management' });
        await server.register(audit_routes_1.auditRoutes, { prefix: '/api/audit' });
    }
    catch (error) {
        logger.error('Error registrando rutas:', error);
    }
    server.get('/health', async (request, reply) => {
        const dbHealthy = await prisma.$queryRaw `SELECT 1`
            .then(() => true)
            .catch(() => false);
        return reply.send({
            status: dbHealthy ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            database: dbHealthy ? 'connected' : 'disconnected',
            rabbitmq: 'disconnected'
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
async function startServer() {
    try {
        const server = await buildServer();
        await server.listen({
            port: env_1.default.PORT,
            host: '0.0.0.0',
        });
        console.log(`
    ╔════════════════════════════════════════════╗
    ║                                            ║
    ║   Ticketing Admin API v1.0.0               ║
    ║                                            ║
    ║   Servidor corriendo en:                   ║
    ║   http://localhost:${env_1.default.PORT}             ║
    ║                                            ║
    ║   Health Check:                            ║
    ║   http://localhost:${env_1.default.PORT}/health      ║
    ║                                            ║
    ╚════════════════════════════════════════════╝
    `);
        logger.info(`Servidor iniciado en puerto ${env_1.default.PORT}`);
        return server;
    }
    catch (error) {
        console.error('ERROR iniciando servidor:', error);
        process.exit(1);
    }
}
