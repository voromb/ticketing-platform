import { FastifyInstance } from 'fastify';
import OrderController from '../controllers/order.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function orderRoutes(fastify: FastifyInstance) {
    // ==================== RUTAS PRIVADAS (Requieren autenticación) ====================
    fastify.register(async fastify => {
        fastify.addHook('preHandler', authMiddleware);

        // Crear orden
        fastify.post(
            '/',
            {
                schema: {
                    tags: ['Orders'],
                    summary: 'Crear nueva orden',
                    description: 'Crea una nueva orden de compra',
                    security: [{ bearerAuth: [] }],
                    body: {
                        type: 'object',
                        required: ['eventId', 'tickets'],
                        properties: {
                            eventId: { type: 'string', description: 'ID del evento' },
                            tickets: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    required: ['localityId', 'quantity'],
                                    properties: {
                                        localityId: {
                                            type: 'string',
                                            description: 'ID de la localidad',
                                        },
                                        quantity: {
                                            type: 'integer',
                                            minimum: 1,
                                            description: 'Cantidad de tickets',
                                        },
                                        price: { type: 'number', description: 'Precio por ticket' },
                                    },
                                },
                            },
                            customerInfo: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    email: { type: 'string', format: 'email' },
                                    phone: { type: 'string' },
                                },
                            },
                        },
                    },
                },
            },
            OrderController.createOrder.bind(OrderController)
        );

        // Obtener mis órdenes
        fastify.get(
            '/my-orders',
            {
                schema: {
                    tags: ['Orders'],
                    summary: 'Mis órdenes',
                    description: 'Obtiene las órdenes del usuario autenticado',
                    security: [{ bearerAuth: [] }],
                    querystring: {
                        type: 'object',
                        properties: {
                            page: { type: 'integer', minimum: 1 },
                            limit: { type: 'integer', minimum: 1, maximum: 100 },
                            status: {
                                type: 'string',
                                enum: ['pending', 'confirmed', 'cancelled', 'completed'],
                            },
                        },
                    },
                },
            },
            OrderController.getMyOrders.bind(OrderController)
        );

        // Obtener orden por ID
        fastify.get(
            '/:id',
            {
                schema: {
                    tags: ['Orders'],
                    summary: 'Obtener orden por ID',
                    description: 'Obtiene los detalles de una orden específica',
                    security: [{ bearerAuth: [] }],
                    params: {
                        type: 'object',
                        required: ['id'],
                        properties: {
                            id: { type: 'string', description: 'ID de la orden' },
                        },
                    },
                },
            },
            OrderController.getOrderById.bind(OrderController)
        );

        // Listar todas las órdenes (solo admin)
        fastify.get(
            '/',
            {
                schema: {
                    tags: ['Orders'],
                    summary: 'Listar todas las órdenes (admin)',
                    description: 'Obtiene la lista de todas las órdenes del sistema',
                    security: [{ bearerAuth: [] }],
                    querystring: {
                        type: 'object',
                        properties: {
                            page: { type: 'integer', minimum: 1 },
                            limit: { type: 'integer', minimum: 1, maximum: 100 },
                            status: {
                                type: 'string',
                                enum: ['pending', 'confirmed', 'cancelled', 'completed'],
                            },
                            eventId: { type: 'string', description: 'Filtrar por evento' },
                            userId: { type: 'string', description: 'Filtrar por usuario' },
                            startDate: { type: 'string', format: 'date-time' },
                            endDate: { type: 'string', format: 'date-time' },
                        },
                    },
                },
            },
            OrderController.getAllOrders.bind(OrderController)
        );

        // Actualizar estado de orden
        fastify.patch(
            '/:id/status',
            {
                schema: {
                    tags: ['Orders'],
                    summary: 'Actualizar estado de orden',
                    description: 'Actualiza el estado de una orden específica',
                    security: [{ bearerAuth: [] }],
                    params: {
                        type: 'object',
                        required: ['id'],
                        properties: {
                            id: { type: 'string', description: 'ID de la orden' },
                        },
                    },
                    body: {
                        type: 'object',
                        required: ['status'],
                        properties: {
                            status: {
                                type: 'string',
                                enum: ['pending', 'confirmed', 'cancelled', 'completed'],
                                description: 'Nuevo estado de la orden',
                            },
                            reason: { type: 'string', description: 'Razón del cambio de estado' },
                        },
                    },
                },
            },
            OrderController.updateOrderStatus.bind(OrderController)
        );

        // Cancelar orden
        fastify.post(
            '/:id/cancel',
            {
                schema: {
                    tags: ['Orders'],
                    summary: 'Cancelar orden',
                    description: 'Cancela una orden específica',
                    security: [{ bearerAuth: [] }],
                    params: {
                        type: 'object',
                        required: ['id'],
                        properties: {
                            id: { type: 'string', description: 'ID de la orden' },
                        },
                    },
                    body: {
                        type: 'object',
                        properties: {
                            reason: { type: 'string', description: 'Razón de la cancelación' },
                        },
                    },
                },
            },
            async (request, reply) => {
                // Cancelar orden usando updateOrderStatus
                const { id } = request.params as { id: string };
                const { reason } = request.body as { reason?: string };

                // Crear request object para updateOrderStatus
                const updateRequest = {
                    ...request,
                    params: { id },
                    body: {
                        status: 'CANCELLED' as any,
                        reason: reason || 'Cancelada por administrador',
                    },
                };

                return OrderController.updateOrderStatus(updateRequest as any, reply);
            }
        );

        // Obtener estadísticas de órdenes
        fastify.get(
            '/stats/summary',
            {
                schema: {
                    tags: ['Orders'],
                    summary: 'Estadísticas de órdenes',
                    description: 'Obtiene estadísticas generales de las órdenes',
                    security: [{ bearerAuth: [] }],
                },
            },
            async (request, reply) => {
                // Implementar estadísticas de órdenes con datos reales
                const totalOrders = await prisma.order.count();
                const ordersByStatus = await prisma.order.groupBy({
                    by: ['status'],
                    _count: { id: true },
                });

                const totalRevenue = await prisma.order.aggregate({
                    where: { status: 'COMPLETED' },
                    _sum: { totalAmount: true },
                });

                const recentOrders = await prisma.order.count({
                    where: {
                        createdAt: {
                            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Últimos 30 días
                        },
                    },
                });

                reply.send({
                    success: true,
                    stats: {
                        totalOrders,
                        ordersByStatus: ordersByStatus.reduce((acc, item) => {
                            acc[item.status] = item._count.id;
                            return acc;
                        }, {} as Record<string, number>),
                        totalRevenue: totalRevenue._sum.totalAmount || 0,
                        recentOrders,
                    },
                });
            }
        );
    });
}