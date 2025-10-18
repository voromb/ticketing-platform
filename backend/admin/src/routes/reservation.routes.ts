import { FastifyInstance } from 'fastify';
import ReservationController from '../controllers/reservation.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function reservationRoutes(fastify: FastifyInstance) {
    // ==================== RUTAS PRIVADAS (Requieren autenticación) ====================
    fastify.register(async fastify => {
        fastify.addHook('preHandler', authMiddleware);

        // Crear reserva (solo VIP)
        fastify.post(
            '/',
            {
                schema: {
                    tags: ['Reservations'],
                    summary: 'Crear nueva reserva',
                    description: 'Crea una nueva reserva (solo para usuarios VIP)',
                    security: [{ bearerAuth: [] }],
                    body: {
                        type: 'object',
                        required: ['eventId', 'localityId', 'quantity'],
                        properties: {
                            eventId: { type: 'string', description: 'ID del evento' },
                            localityId: { type: 'string', description: 'ID de la localidad' },
                            quantity: {
                                type: 'integer',
                                minimum: 1,
                                maximum: 10,
                                description: 'Cantidad de tickets a reservar',
                            },
                            specialRequests: {
                                type: 'string',
                                description: 'Solicitudes especiales',
                            },
                        },
                    },
                },
            },
            ReservationController.createReservation.bind(ReservationController)
        );

        // Obtener mis reservas
        fastify.get(
            '/my-reservations',
            {
                schema: {
                    tags: ['Reservations'],
                    summary: 'Mis reservas',
                    description: 'Obtiene las reservas del usuario autenticado',
                    security: [{ bearerAuth: [] }],
                    querystring: {
                        type: 'object',
                        properties: {
                            status: {
                                type: 'string',
                                enum: ['pending', 'confirmed', 'cancelled', 'expired'],
                            },
                            page: { type: 'integer', minimum: 1 },
                            limit: { type: 'integer', minimum: 1, maximum: 100 },
                        },
                    },
                },
            },
            ReservationController.getMyReservations.bind(ReservationController)
        );

        // Obtener todas las reservas (solo admin) - ANTES de /:id
        fastify.get(
            '/all',
            {
                schema: {
                    tags: ['Reservations'],
                    summary: 'Listar todas las reservas (admin)',
                    description: 'Obtiene la lista de todas las reservas del sistema',
                    security: [{ bearerAuth: [] }],
                    querystring: {
                        type: 'object',
                        properties: {
                            status: {
                                type: 'string',
                                enum: ['pending', 'confirmed', 'cancelled', 'expired'],
                            },
                            eventId: { type: 'string', description: 'Filtrar por evento' },
                            userId: { type: 'string', description: 'Filtrar por usuario' },
                            page: { type: 'integer', minimum: 1 },
                            limit: { type: 'integer', minimum: 1, maximum: 100 },
                            startDate: { type: 'string', format: 'date-time' },
                            endDate: { type: 'string', format: 'date-time' },
                        },
                    },
                },
            },
            ReservationController.getAllReservations.bind(ReservationController)
        );

        // Obtener reserva por ID
        fastify.get(
            '/:id',
            {
                schema: {
                    tags: ['Reservations'],
                    summary: 'Obtener reserva por ID',
                    description: 'Obtiene los detalles de una reserva específica',
                    security: [{ bearerAuth: [] }],
                    params: {
                        type: 'object',
                        required: ['id'],
                        properties: {
                            id: { type: 'string', description: 'ID de la reserva' },
                        },
                    },
                },
            },
            ReservationController.getReservationById.bind(ReservationController)
        );

        // Confirmar reserva
        fastify.post(
            '/:id/confirm',
            {
                schema: {
                    tags: ['Reservations'],
                    summary: 'Confirmar reserva',
                    description: 'Confirma una reserva pendiente',
                    security: [{ bearerAuth: [] }],
                    params: {
                        type: 'object',
                        required: ['id'],
                        properties: {
                            id: { type: 'string', description: 'ID de la reserva' },
                        },
                    },
                },
            },
            async (request, reply) => {
                // Confirmar reserva con datos reales
                const { id } = request.params as { id: string };
                const user = (request as any).user;

                try {
                    // Buscar la reserva
                    const reservation = await prisma.reservation.findUnique({
                        where: { id },
                        include: {
                            event: true,
                            locality: true,
                        },
                    });

                    if (!reservation) {
                        return reply
                            .code(404)
                            .send({ success: false, error: 'Reserva no encontrada' });
                    }

                    // Verificar que está activa y no expirada
                    if (reservation.status !== 'ACTIVE') {
                        return reply
                            .code(400)
                            .send({ success: false, error: 'La reserva no está activa' });
                    }

                    if (new Date() > reservation.expiresAt) {
                        return reply
                            .code(400)
                            .send({ success: false, error: 'La reserva ha expirado' });
                    }

                    // Actualizar estado a confirmada
                    const confirmedReservation = await prisma.reservation.update({
                        where: { id },
                        data: { status: 'CONFIRMED' as any },
                    });

                    reply.send({
                        success: true,
                        data: confirmedReservation,
                        message: 'Reserva confirmada exitosamente',
                    });
                } catch (error) {
                    reply
                        .code(500)
                        .send({ success: false, error: 'Error al confirmar la reserva' });
                }
            }
        );

        // Actualizar estado de reserva
        fastify.patch(
            '/:id/status',
            {
                schema: {
                    tags: ['Reservations'],
                    summary: 'Actualizar estado de reserva',
                    description: 'Actualiza el estado de una reserva específica',
                    security: [{ bearerAuth: [] }],
                    params: {
                        type: 'object',
                        required: ['id'],
                        properties: {
                            id: { type: 'string', description: 'ID de la reserva' },
                        },
                    },
                    body: {
                        type: 'object',
                        required: ['status'],
                        properties: {
                            status: {
                                type: 'string',
                                enum: ['pending', 'confirmed', 'cancelled', 'expired'],
                                description: 'Nuevo estado de la reserva',
                            },
                            reason: { type: 'string', description: 'Razón del cambio de estado' },
                        },
                    },
                },
            },
            async (request, reply) => {
                // Actualizar estado de reserva con datos reales
                const { id } = request.params as { id: string };
                const { status, reason } = request.body as { status: string; reason?: string };
                const user = (request as any).user;

                try {
                    // Verificar que el estado es válido
                    const validStatuses = ['pending', 'confirmed', 'cancelled', 'expired'];
                    if (!validStatuses.includes(status)) {
                        return reply.code(400).send({ success: false, error: 'Estado inválido' });
                    }

                    // Buscar la reserva
                    const reservation = await prisma.reservation.findUnique({
                        where: { id },
                    });

                    if (!reservation) {
                        return reply
                            .code(404)
                            .send({ success: false, error: 'Reserva no encontrada' });
                    }

                    // Actualizar estado
                    const updatedReservation = await prisma.reservation.update({
                        where: { id },
                        data: {
                            status: status.toUpperCase() as any,
                            // Si se cancela o expira, liberar stock
                            ...(status === 'cancelled' || status === 'expired' ? {} : {}),
                        },
                    });

                    // Si se cancela o expira, liberar stock de la localidad
                    if (status === 'cancelled' || status === 'expired') {
                        await prisma.eventLocality.update({
                            where: { id: reservation.localityId },
                            data: {
                                availableTickets: { increment: reservation.quantity },
                                reservedTickets: { decrement: reservation.quantity },
                            },
                        });
                    }

                    reply.send({
                        success: true,
                        data: updatedReservation,
                        message: `Estado de reserva actualizado a ${status}`,
                    });
                } catch (error) {
                    reply
                        .code(500)
                        .send({
                            success: false,
                            error: 'Error al actualizar el estado de la reserva',
                        });
                }
            }
        );

        // Cancelar reserva
        fastify.delete(
            '/:id',
            {
                schema: {
                    tags: ['Reservations'],
                    summary: 'Cancelar reserva',
                    description: 'Cancela una reserva específica',
                    security: [{ bearerAuth: [] }],
                    params: {
                        type: 'object',
                        required: ['id'],
                        properties: {
                            id: { type: 'string', description: 'ID de la reserva' },
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
            ReservationController.cancelReservation.bind(ReservationController)
        );

        // Obtener estadísticas de reservas
        fastify.get(
            '/stats/summary',
            {
                schema: {
                    tags: ['Reservations'],
                    summary: 'Estadísticas de reservas',
                    description: 'Obtiene estadísticas generales de las reservas',
                    security: [{ bearerAuth: [] }],
                },
            },
            async (request, reply) => {
                // Estadísticas de reservas con datos reales
                try {
                    const totalReservations = await prisma.reservation.count();
                    const reservationsByStatus = await prisma.reservation.groupBy({
                        by: ['status'],
                        _count: { id: true },
                    });

                    const activeReservations = await prisma.reservation.count({
                        where: {
                            status: 'ACTIVE',
                            expiresAt: { gt: new Date() },
                        },
                    });

                    const expiredToday = await prisma.reservation.count({
                        where: {
                            status: 'EXPIRED',
                            updatedAt: {
                                gte: new Date(new Date().setHours(0, 0, 0, 0)),
                            },
                        },
                    });

                    // TODO: Implement VIP users count when user model is available
                    const vipUsers = 0; 
                    // const vipUsers = await prisma.user.count({
                    //     where: { role: 'VIP' },
                    // });

                    reply.send({
                        success: true,
                        stats: {
                            totalReservations,
                            activeReservations,
                            expiredToday,
                            vipUsers,
                            reservationsByStatus: reservationsByStatus.reduce((acc, item) => {
                                acc[item.status] = item._count.id;
                                return acc;
                            }, {} as Record<string, number>),
                        },
                    });
                } catch (error) {
                    reply
                        .code(500)
                        .send({
                            success: false,
                            error: 'Error al obtener estadísticas de reservas',
                        });
                }
            }
        );
    });
}
