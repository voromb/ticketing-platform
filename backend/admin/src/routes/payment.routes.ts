import { FastifyInstance } from 'fastify';
import PaymentController from '../controllers/payment.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function paymentRoutes(fastify: FastifyInstance) {
    // ==================== RUTAS PRIVADAS (Requieren autenticación) ====================
    fastify.register(async fastify => {
        fastify.addHook('preHandler', authMiddleware);

        // Crear sesión de checkout
        fastify.post(
            '/create-checkout',
            {
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
            },
            PaymentController.createCheckoutSession.bind(PaymentController)
        );

        // Completar pago interno (cuando no hay Stripe configurado)
        fastify.post(
            '/complete-payment',
            {
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
            },
            PaymentController.completeDemoPayment.bind(PaymentController)
        );

        // Verificar estado de pago
        fastify.get(
            '/status/:sessionId',
            {
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
            },
            PaymentController.checkPaymentStatus.bind(PaymentController)
        );

        // Listar pagos (admin)
        fastify.get(
            '/',
            {
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
            },
            async (request, reply) => {
                // Implementar listado de pagos con datos reales
                const user = (request as any).user;

                // Obtener pagos desde la base de datos
                const payments = await prisma.payment.findMany({
                    include: {
                        order: {
                            include: {
                                event: true,
                                user: {
                                    select: { email: true, firstName: true, lastName: true },
                                },
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                });

                reply.send({
                    success: true,
                    payments: payments,
                    total: payments.length,
                });
            }
        );

        // Obtener estadísticas de pagos
        fastify.get(
            '/stats',
            {
                schema: {
                    tags: ['Payments'],
                    summary: 'Estadísticas de pagos',
                    description: 'Obtiene estadísticas de los pagos del sistema',
                    security: [{ bearerAuth: [] }],
                },
            },
            async (request, reply) => {
                // Implementar estadísticas de pagos con datos reales
                const totalPayments = await prisma.payment.count();
                const successfulPayments = await prisma.payment.count({
                    where: { status: 'COMPLETED' },
                });
                const totalRevenue = await prisma.payment.aggregate({
                    where: { status: 'COMPLETED' },
                    _sum: { amount: true },
                });

                reply.send({
                    success: true,
                    stats: {
                        totalPayments,
                        successfulPayments,
                        failedPayments: totalPayments - successfulPayments,
                        totalRevenue: totalRevenue._sum.amount || 0,
                        successRate:
                            totalPayments > 0
                                ? ((successfulPayments / totalPayments) * 100).toFixed(2)
                                : 0,
                    },
                });
            }
        );
    });

    // ==================== WEBHOOK (Sin autenticación) ====================
    // El webhook de Stripe viene desde sus servidores, no requiere JWT
    fastify.post(
        '/webhook',
        {
            config: {
                rawBody: true, // Necesario para verificar firma de Stripe
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
        },
        PaymentController.handleWebhook.bind(PaymentController)
    );
}