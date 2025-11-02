"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildServer = buildServer;
exports.startServer = startServer;
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const multipart_1 = __importDefault(require("@fastify/multipart"));
const static_1 = __importDefault(require("@fastify/static"));
const swagger_1 = __importDefault(require("@fastify/swagger"));
const swagger_ui_1 = __importDefault(require("@fastify/swagger-ui"));
const compress_1 = __importDefault(require("@fastify/compress"));
const client_1 = require("@prisma/client");
const path_1 = __importDefault(require("path"));
const pino_1 = __importDefault(require("pino"));
// Routes
const auth_routes_1 = require("./routes/auth.routes");
const event_routes_1 = require("./routes/event.routes");
const venue_routes_1 = require("./routes/venue.routes");
const admin_routes_1 = require("./routes/admin.routes");
const audit_routes_1 = require("./routes/audit.routes");
const user_management_routes_1 = require("./routes/user-management.routes");
const category_routes_1 = require("./routes/category.routes");
const reservation_routes_1 = require("./routes/reservation.routes");
const order_routes_1 = require("./routes/order.routes");
const payment_routes_1 = require("./routes/payment.routes");
const image_upload_routes_1 = require("./routes/image-upload.routes");
const company_routes_1 = require("./routes/company.routes");
const company_admin_routes_1 = require("./routes/company-admin.routes");
const approval_routes_1 = require("./routes/approval.routes");
const messaging_users_routes_1 = require("./routes/messaging-users.routes");
const image_upload_service_1 = require("./services/image-upload.service");
// Jobs
const reservation_cron_1 = require("./jobs/reservation.cron");
// Config
const env_1 = __importDefault(require("./config/env"));
// Middlewares
const audit_middleware_1 = require("./middlewares/audit.middleware");
// Crear logger
const logger = (0, pino_1.default)({
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
async function buildServer() {
    const server = (0, fastify_1.default)({
        logger: false,
        bodyLimit: 10485760, // 10MB - Aumentado para permitir archivos grandes
    });
    // Inicializar servicios
    const prisma = new client_1.PrismaClient();
    (0, audit_middleware_1.registerAuditMiddleware)(prisma);
    // Inicializar RabbitMQ
    const { rabbitmqService } = await Promise.resolve().then(() => __importStar(require('./services/rabbitmq.service')));
    await rabbitmqService.connect();
    // Registrar soporte multipart para upload de archivos
    await server.register(multipart_1.default, {
        limits: {
            fieldNameSize: 100,
            fieldSize: 100,
            fields: 10,
            fileSize: 5242880, // 5MB por archivo
            files: 15, // Máximo 15 archivos
            headerPairs: 2000,
        },
    });
    // Registrar compresión Brotli/Gzip
    await server.register(compress_1.default, {
        global: true,
        encodings: ['br', 'gzip', 'deflate'], // Brotli primero
        threshold: 1024, // Solo comprimir respuestas > 1KB
    });
    // Registrar CORS
    await server.register(cors_1.default, {
        origin: true,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Id', 'X-User-Name', 'X-User-Type'],
        exposedHeaders: ['X-User-Id', 'X-User-Name', 'X-User-Type'],
    });
    // Registrar JWT
    await server.register(jwt_1.default, {
        secret: env_1.default.JWT_SECRET,
    });
    // Registrar Swagger
    await server.register(swagger_1.default, {
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
    await server.register(swagger_ui_1.default, {
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
    await server.register(static_1.default, {
        root: path_1.default.join(__dirname, '../uploads'),
        prefix: '/uploads/',
        constraints: {},
    });
    // Inicializar servicio de imágenes
    await image_upload_service_1.imageUploadService.initialize();
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
            error: error.message || 'Internal Server Error',
        });
    });
    try {
        console.log('[INIT] Iniciando registro de rutas...');
        console.log('[REGISTER] Registrando authRoutes...');
        await server.register(auth_routes_1.authRoutes, { prefix: '/api/auth' });
        console.log('[OK] authRoutes OK');
        console.log('[REGISTER] Registrando eventRoutes...');
        await server.register(event_routes_1.eventRoutes, { prefix: '/api/events' });
        console.log('[OK] eventRoutes OK');
        console.log('[REGISTER] Registrando venueRoutes...');
        await server.register(venue_routes_1.venueRoutes, { prefix: '/api/venues' });
        console.log('[OK] venueRoutes OK');
        console.log('[REGISTER] Registrando adminRoutes...');
        await server.register(admin_routes_1.adminRoutes, { prefix: '/api/admins' });
        console.log('[OK] adminRoutes OK');
        console.log('[REGISTER] Registrando userManagementRoutes...');
        await server.register(user_management_routes_1.userManagementRoutes, { prefix: '/api/user-management' });
        console.log('[OK] userManagementRoutes OK');
        console.log('[REGISTER] Registrando auditRoutes...');
        await server.register(audit_routes_1.auditRoutes, { prefix: '/api/audit' });
        console.log('[OK] auditRoutes OK');
        console.log('[REGISTER] Registrando categoryRoutes...');
        await server.register(category_routes_1.categoryRoutes, { prefix: '/api/categories' });
        console.log('[OK] categoryRoutes OK');
        console.log('[REGISTER] Registrando reservationRoutes...');
        await server.register(reservation_routes_1.reservationRoutes, { prefix: '/api/reservations' });
        console.log('[OK] reservationRoutes OK');
        console.log('[REGISTER] Registrando orderRoutes...');
        await server.register(order_routes_1.orderRoutes, { prefix: '/api/orders' });
        console.log('[OK] orderRoutes OK');
        console.log('[REGISTER] Registrando paymentRoutes...');
        await server.register(payment_routes_1.paymentRoutes, { prefix: '/api/payments' });
        console.log('[OK] paymentRoutes OK');
        console.log('[REGISTER] Registrando imageUploadRoutes...');
        await server.register(image_upload_routes_1.imageUploadRoutes, { prefix: '/api/upload' });
        console.log('[OK] imageUploadRoutes OK');
        console.log('[REGISTER] Registrando companyRoutes...');
        await server.register(company_routes_1.companyRoutes, { prefix: '/api' });
        console.log('[OK] companyRoutes OK');
        console.log('[REGISTER] Registrando companyAdminRoutes...');
        await server.register(company_admin_routes_1.companyAdminRoutes, { prefix: '/api' });
        console.log('[OK] companyAdminRoutes OK');
        console.log('[REGISTER] Registrando approvalRoutes...');
        await server.register(approval_routes_1.approvalRoutes, { prefix: '/api/approvals' });
        console.log('[OK] approvalRoutes OK');
        console.log('[REGISTER] Registrando messagingUsersRoutes...');
        await server.register(messaging_users_routes_1.messagingUsersRoutes, { prefix: '/api/messaging-users' });
        console.log('[OK] messagingUsersRoutes OK');
        console.log('[SUCCESS] Todas las rutas registradas exitosamente');
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        logger.error({ err: error }, '[ERROR] Error registrando rutas');
        console.error('[ERROR] Error completo:', errorMessage);
        if (errorStack) {
            console.error('[ERROR] Stack:', errorStack);
        }
    }
    // Health check
    server.get('/health', async (request, reply) => {
        const dbHealthy = await prisma.$queryRaw `SELECT 1`.then(() => true).catch(() => false);
        const { rabbitmqService } = await Promise.resolve().then(() => __importStar(require('./services/rabbitmq.service')));
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
    ║   Uploads disponibles en:                  ║
    ║   http://localhost:${env_1.default.PORT}/api/upload  ║
    ║                                            ║
    ╚════════════════════════════════════════════╝
    `);
        logger.info(`Servidor iniciado en puerto ${env_1.default.PORT}`);
        logger.info(`Servicio de imágenes inicializado`);
        // Iniciar cron job de reservas
        (0, reservation_cron_1.startReservationCron)();
        return server;
    }
    catch (error) {
        console.error('ERROR iniciando servidor:', error);
        process.exit(1);
    }
}
