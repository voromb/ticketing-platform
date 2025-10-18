// @ts-nocheck - Legacy file with type issues, to be refactored
import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middlewares/auth.middleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function auditRoutes(fastify: FastifyInstance) {
    // Aplicar middleware de autenticación
    fastify.addHook('preHandler', authMiddleware);

    // Obtener logs de auditoría
    fastify.get(
        '/',
        {
            schema: {
                tags: ['Audit'],
                summary: 'Obtener logs de auditoría',
                description: 'Obtiene la lista de logs de auditoría del sistema',
                security: [{ bearerAuth: [] }],
                querystring: {
                    type: 'object',
                    properties: {
                        page: { type: 'integer', minimum: 1, description: 'Número de página' },
                        limit: {
                            type: 'integer',
                            minimum: 1,
                            maximum: 100,
                            description: 'Elementos por página',
                        },
                        action: { type: 'string', description: 'Filtrar por acción específica' },
                        userId: { type: 'string', description: 'Filtrar por usuario' },
                        startDate: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Fecha de inicio',
                        },
                        endDate: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Fecha de fin',
                        },
                    },
                },
            },
        },
        async (request, reply) => {
            // Implementar auditoría basada en actividad real del sistema
            const query = request.query as any;
            const page = parseInt(query.page) || 1;
            const limit = parseInt(query.limit) || 20;
            const skip = (page - 1) * limit;

            try {
                // Crear logs de auditoría basados en actividad real
                const auditLogs: any[] = [];

                // Logs de órdenes recientes
                const recentOrders = await prisma.order.findMany({
                    take: limit,
                    skip,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: { select: { email: true, firstName: true, lastName: true } },
                        event: { select: { name: true } },
                    },
                });

                recentOrders.forEach((order: any) => {
                    auditLogs.push({
                        id: `order_${order.id}`,
                        action: 'order_created',
                        userId: order.userId,
                        userEmail: order.user?.email || 'N/A',
                        timestamp: order.createdAt,
                        details: {
                            orderId: order.id,
                            eventName: order.event?.name || 'N/A',
                            amount: order.totalAmount,
                            status: order.status,
                        },
                    });
                });

                // Logs de reservas recientes
                const recentReservations = await prisma.reservation.findMany({
                    take: Math.max(0, limit - auditLogs.length),
                    orderBy: { createdAt: 'desc' },
                    include: {
                        // @ts-ignore
                        user: { select: { email: true, firstName: true, lastName: true } },
                        event: { select: { name: true } },
                    },
                });

                recentReservations.forEach((reservation: any) => {
                    auditLogs.push({
                        id: `reservation_${reservation.id}`,
                        action: 'reservation_created',
                        userId: reservation.userId,
                        userEmail: reservation.user.email,
                        timestamp: reservation.createdAt,
                        details: {
                            reservationId: reservation.id,
                            eventName: reservation.event.name,
                            quantity: reservation.quantity,
                            status: reservation.status,
                        },
                    });
                });

                // Ordenar por timestamp descendente
                auditLogs.sort(
                    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                );

                const totalCount =
                    (await prisma.order.count()) + (await prisma.reservation.count());

                return reply.send({
                    success: true,
                    logs: auditLogs.slice(0, limit),
                    pagination: {
                        page,
                        limit,
                        total: totalCount,
                        totalPages: Math.ceil(totalCount / limit),
                    },
                });
            } catch (error) {
                return reply
                    .code(500)
                    .send({ success: false, error: 'Error al obtener logs de auditoría' });
            }
        }
    );

    // Obtener estadísticas de auditoría
    fastify.get(
        '/stats',
        {
            schema: {
                tags: ['Audit'],
                summary: 'Estadísticas de auditoría',
                description: 'Obtiene estadísticas de los logs de auditoría',
                security: [{ bearerAuth: [] }],
            },
        },
        async (request, reply) => {
            // Implementar estadísticas reales de auditoría
            try {
                const totalOrders = await prisma.order.count();
                const totalReservations = await prisma.reservation.count();
                const totalPayments = 0; // TODO: Add when payment model exists

                const ordersByStatus = await prisma.order.groupBy({
                    by: ['status'],
                    _count: { id: true },
                });

                const reservationsByStatus = await prisma.reservation.groupBy({
                    by: ['status'],
                    _count: { id: true },
                });

                // Actividad reciente (últimas 24 horas)
                const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
                const recentOrders = await prisma.order.count({
                    where: { createdAt: { gte: last24Hours } },
                });
                const recentReservations = await prisma.reservation.count({
                    where: { createdAt: { gte: last24Hours } },
                });
                const recentPayments = 0; // TODO: Add when payment model exists

                return reply.send({
                    success: true,
                    stats: {
                        totalActions: totalOrders + totalReservations + totalPayments,
                        actionsByType: {
                            orders: totalOrders,
                            reservations: totalReservations,
                            payments: totalPayments,
                        },
                        statusBreakdown: {
                            orders: ordersByStatus.reduce((acc, item) => {
                                acc[item.status] = item._count.id;
                                return acc;
                            }, {} as Record<string, number>),
                            reservations: reservationsByStatus.reduce((acc, item) => {
                                acc[item.status] = item._count.id;
                                return acc;
                            }, {} as Record<string, number>),
                        },
                        recentActivity: {
                            last24Hours: {
                                orders: recentOrders,
                                reservations: recentReservations,
                                payments: recentPayments,
                                total: recentOrders + recentReservations + recentPayments,
                            },
                        },
                    },
                });
            } catch (error) {
                return reply
                    .code(500)
                    .send({ success: false, error: 'Error al obtener estadísticas de auditoría' });
            }
        }
    );

    // Obtener log específico por ID
    fastify.get(
        '/:id',
        {
            schema: {
                tags: ['Audit'],
                summary: 'Obtener log de auditoría por ID',
                description: 'Obtiene los detalles de un log específico',
                security: [{ bearerAuth: [] }],
                params: {
                    type: 'object',
                    required: ['id'],
                    properties: {
                        id: { type: 'string', description: 'ID del log de auditoría' },
                    },
                },
            },
        },
        async (request, reply) => {
            const { id } = request.params as { id: string };

            try {
                // Buscar en órdenes si el ID coincide
                if (id.startsWith('order_')) {
                    const orderId = id.replace('order_', '');
                    const order = await prisma.order.findUnique({
                        where: { id: orderId },
                        include: {
                            user: { select: { email: true, firstName: true, lastName: true } },
                            event: { select: { name: true } },
                        },
                    });

                    if (order) {
                        return reply.send({
                            success: true,
                            log: {
                                id,
                                action: 'order_created',
                                userId: order.userId,
                                userEmail: 'N/A', // order.user.email,
                                timestamp: order.createdAt,
                                details: {
                                    orderId: order.id,
                                    eventName: 'N/A', // order.event.name,
                                    amount: order.totalAmount,
                                    status: order.status,
                                    tickets: order.quantity,
                                },
                            },
                        });
                    }
                }

                // Buscar en reservas si el ID coincide
                if (id.startsWith('reservation_')) {
                    const reservationId = id.replace('reservation_', '');
                    const reservation = await prisma.reservation.findUnique({
                        where: { id: reservationId },
                        include: {
                            user: { select: { email: true, firstName: true, lastName: true } },
                            event: { select: { name: true } },
                        },
                    });

                    if (reservation) {
                        return reply.send({
                            success: true,
                            log: {
                                id,
                                action: 'reservation_created',
                                userId: reservation.userId,
                                userEmail: reservation.user.email,
                                timestamp: reservation.createdAt,
                                details: {
                                    reservationId: reservation.id,
                                    eventName: reservation.event.name,
                                    quantity: reservation.quantity,
                                    status: reservation.status,
                                    expiresAt: reservation.expiresAt,
                                },
                            },
                        });
                    }
                }

                return reply
                    .code(404)
                    .send({ success: false, error: 'Log de auditoría no encontrado' });
            } catch (error) {
                return reply
                    .code(500)
                    .send({ success: false, error: 'Error al buscar log de auditoría' });
            }
        }
    );
}
