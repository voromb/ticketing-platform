"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRoutes = paymentRoutes;
const payment_controller_1 = __importDefault(require("../controllers/payment.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function paymentRoutes(fastify) {
    // ==================== RUTAS PRIVADAS (Requieren autenticación) ====================
    fastify.register(async (fastify) => {
        fastify.addHook('preHandler', auth_middleware_1.authMiddleware);
        // Crear sesión de checkout
        fastify.post('/create-checkout', {
            schema: {
                tags: ['Payments'],
                summary: 'Crear sesión de pago',
                description: 'Crea una nueva sesión de checkout para procesar el pago',
                security: [{ bearerAuth: [] }],
                body: {
                    type: 'object',
                    required: ['orderId'],
                    properties: {
                        orderId: { type: 'string', description: 'ID de la orden asociada' },
                        successUrl: {
                            type: 'string',
                            format: 'uri',
                            description: 'URL de éxito',
                        },
                        cancelUrl: {
                            type: 'string',
                            format: 'uri',
                            description: 'URL de cancelación',
                        },
                    },
                },
            },
        }, payment_controller_1.default.createCheckoutSession.bind(payment_controller_1.default));
        // Completar pago interno (cuando no hay Stripe configurado)
        fastify.post('/complete-payment', {
            schema: {
                tags: ['Payments'],
                summary: 'Completar pago demo',
                description: 'Completa un pago en modo demo (sin Stripe)',
                security: [{ bearerAuth: [] }],
                body: {
                    type: 'object',
                    required: ['orderId'],
                    properties: {
                        orderId: { type: 'string', description: 'ID de la orden' },
                        paymentMethodId: {
                            type: 'string',
                            description: 'ID del método de pago (opcional en modo demo)',
                        },
                        amount: { type: 'number', description: 'Monto del pago' },
                    },
                },
            },
        }, payment_controller_1.default.completeDemoPayment.bind(payment_controller_1.default));
        // Verificar estado de pago
        fastify.get('/status/:sessionId', {
            schema: {
                tags: ['Payments'],
                summary: 'Verificar estado de pago',
                description: 'Verifica el estado actual de una sesión de pago',
                security: [{ bearerAuth: [] }],
                params: {
                    type: 'object',
                    required: ['sessionId'],
                    properties: {
                        sessionId: { type: 'string', description: 'ID de la sesión de pago' },
                    },
                },
            },
        }, payment_controller_1.default.checkPaymentStatus.bind(payment_controller_1.default));
        // Listar pagos (admin)
        fastify.get('/', {
            schema: {
                tags: ['Payments'],
                summary: 'Listar pagos',
                description: 'Obtiene la lista de todos los pagos del sistema',
                security: [{ bearerAuth: [] }],
                querystring: {
                    type: 'object',
                    properties: {
                        page: { type: 'integer', minimum: 1 },
                        limit: { type: 'integer', minimum: 1, maximum: 100 },
                        status: {
                            type: 'string',
                            enum: ['pending', 'completed', 'failed', 'cancelled'],
                        },
                        orderId: { type: 'string' },
                    },
                },
            },
        }, async (request, reply) => {
            // TODO: Implement when payment model is added to Prisma schema
            reply.send({
                success: true,
                message: 'Payment listing - To be implemented',
                payments: [],
                total: 0,
            });
        });
        // Obtener estadísticas de pagos
        fastify.get('/stats', {
            schema: {
                tags: ['Payments'],
                summary: 'Estadísticas de pagos',
                description: 'Obtiene estadísticas de los pagos del sistema',
                security: [{ bearerAuth: [] }],
            },
        }, async (request, reply) => {
            // TODO: Implement when payment model is added to Prisma schema
            const totalPayments = 0;
            const successfulPayments = 0;
            const totalRevenue = { _sum: { amount: 0 } };
            reply.send({
                success: true,
                stats: {
                    totalPayments,
                    successfulPayments,
                    failedPayments: totalPayments - successfulPayments,
                    totalRevenue: totalRevenue._sum.amount || 0,
                    successRate: totalPayments > 0
                        ? ((successfulPayments / totalPayments) * 100).toFixed(2)
                        : 0,
                },
            });
        });
    });
    // ==================== WEBHOOK (Sin autenticación) ====================
    // El webhook de Stripe viene desde sus servidores, no requiere JWT
    fastify.post('/webhook', {
        config: {
        // rawBody: true, // TODO: Configure when Stripe webhook is implemented
        },
        schema: {
            tags: ['Payments'],
            summary: 'Webhook de Stripe',
            description: 'Endpoint para recibir notificaciones de Stripe',
            body: {
                type: 'object',
                description: 'Datos del webhook de Stripe',
            },
        },
    }, payment_controller_1.default.handleWebhook.bind(payment_controller_1.default));
}
