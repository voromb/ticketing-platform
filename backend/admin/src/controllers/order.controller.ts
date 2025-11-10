// @ts-nocheck - Legacy file with type issues, to be refactored
import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient, OrderStatus } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// DTOs
interface CreateOrderDTO {
    eventId: string;
    tickets: Array<{
        localityId: string;
        quantity: number;
        price?: number;
    }>;
    customerInfo?: {
        name?: string;
        email?: string;
        phone?: string;
    };
    reservationId?: string; // Opcional: si viene de una reserva
}

class OrderController {
    // ==================== CREAR ORDEN ====================
    async createOrder(request: FastifyRequest<{ Body: CreateOrderDTO }>, reply: FastifyReply) {
        try {
            const user = (request as any).user;
            const { eventId, tickets, customerInfo, reservationId } = request.body;

            if (!user?.id || !user?.email) {
                return reply.code(403).send({ success: false, error: 'Usuario no autenticado' });
            }

            if (!tickets || tickets.length === 0) {
                return reply
                    .code(400)
                    .send({ success: false, error: 'Debe incluir al menos un ticket' });
            }

            // 1. Verificar que el evento existe
            const event = await prisma.event.findUnique({
                where: { id: eventId },
                include: { localities: true },
            });

            if (!event) {
                return reply.code(404).send({ success: false, error: 'Evento no encontrado' });
            }

            // 2. Verificar todas las localidades y calcular total
            let totalAmount = 0;
            const validatedTickets = [];

            for (const ticket of tickets) {
                const locality = await prisma.eventLocality.findUnique({
                    where: { id: ticket.localityId },
                });

                if (!locality) {
                    return reply.code(404).send({
                        success: false,
                        error: `Localidad ${ticket.localityId} no encontrada`,
                    });
                }

                if (locality.eventId !== eventId) {
                    return reply.code(400).send({
                        success: false,
                        error: `La localidad ${locality.name} no pertenece a este evento`,
                    });
                }

                if (!locality.isActive) {
                    return reply.code(400).send({
                        success: false,
                        error: `La localidad ${locality.name} no está activa`,
                    });
                }

                // Verificar stock disponible
                if (ticket.quantity > locality.availableTickets) {
                    return reply.code(400).send({
                        success: false,
                        error: `Stock insuficiente para ${locality.name}. Disponibles: ${locality.availableTickets}`,
                    });
                }

                const ticketPrice = ticket.price || locality.price;
                totalAmount += ticketPrice * ticket.quantity;

                validatedTickets.push({
                    localityId: ticket.localityId,
                    quantity: ticket.quantity,
                    price: ticketPrice,
                    locality: locality,
                });
            }

            // 3. Si viene de una reserva, verificar que existe y pertenece al usuario
            let reservation = null;
            if (reservationId) {
                reservation = await prisma.reservation.findUnique({
                    where: { id: reservationId },
                });

                if (!reservation) {
                    return reply.code(404).send({ success: false, error: 'Reserva no encontrada' });
                }

                if (reservation.userId !== user.id) {
                    return reply
                        .code(403)
                        .send({ success: false, error: 'La reserva no te pertenece' });
                }

                if (reservation.status !== 'ACTIVE') {
                    return reply
                        .code(400)
                        .send({ success: false, error: 'La reserva no está activa' });
                }

                // Verificar que no haya expirado
                if (reservation.expiresAt < new Date()) {
                    return reply
                        .code(400)
                        .send({ success: false, error: 'La reserva ha expirado' });
                }
            }

            // 4. Aplicar descuento VIP (10%)
            const isVip = user.role && ['vip', 'VIP'].includes(user.role);
            const discount = isVip ? totalAmount * 0.1 : 0;
            const finalAmount = totalAmount - discount;

            // 5. Crear orden con transacción
            const order = await prisma.$transaction(async tx => {
                // Crear la orden principal
                const newOrder = await tx.order.create({
                    data: {
                        userId: user.id,
                        userEmail: user.email,
                        eventId,
                        // Para compatibilidad, usando el primer ticket para los campos legacy
                        localityId: validatedTickets[0].localityId,
                        quantity: validatedTickets.reduce((sum, t) => sum + t.quantity, 0),
                        totalAmount,
                        discount,
                        finalAmount,
                        status: OrderStatus.PENDING,
                        reservationId: reservationId || null,
                    },
                });

                // Crear los tickets individuales y actualizar stock
                for (const ticketInfo of validatedTickets) {
                    // Crear tickets
                    const ticketsToCreate = Array.from(
                        { length: ticketInfo.quantity },
                        (_, index) => ({
                            orderId: newOrder.id,
                            eventId: eventId,
                            localityId: ticketInfo.localityId,
                            userId: user.id,
                            ticketCode: `${newOrder.id}-${ticketInfo.localityId}-${index + 1}`,
                            status: 'VALID' as const,
                            qrCode: `QR-${newOrder.id}-${ticketInfo.localityId}-${index + 1}`,
                        })
                    );

                    await tx.ticket.createMany({
                        data: ticketsToCreate,
                    });

                    // Si NO viene de reserva, actualizar stock inmediatamente
                    if (!reservationId) {
                        await tx.eventLocality.update({
                            where: { id: ticketInfo.localityId },
                            data: {
                                soldTickets: { increment: ticketInfo.quantity },
                                availableTickets: { decrement: ticketInfo.quantity },
                            },
                        });
                    }
                }

                // Si viene de reserva, marcar la reserva como completada
                if (reservationId) {
                    await tx.reservation.update({
                        where: { id: reservationId },
                        data: { status: 'COMPLETED' },
                    });
                }

                // Retornar orden con datos completos
                return await tx.order.findUnique({
                    where: { id: newOrder.id },
                    include: {
                        event: {
                            select: {
                                id: true,
                                name: true,
                                eventDate: true,
                                bannerImage: true,
                            },
                        },
                        locality: {
                            select: {
                                id: true,
                                name: true,
                                price: true,
                            },
                        },
                        tickets: {
                            select: {
                                id: true,
                                ticketCode: true,
                                qrCode: true,
                                status: true,
                                locality: {
                                    select: {
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                });
            });

            logger.info(
                `Orden creada: ${order.id} por usuario ${user.id} (VIP: ${isVip}) con ${validatedTickets.length} tipos de tickets`
            );

            return reply.code(201).send({
                success: true,
                data: order,
                message: 'Orden creada exitosamente',
            });
        } catch (error: any) {
            logger.error({ err: error }, 'Error creating order:');
            return reply.status(500).send({ success: false, error: 'Error interno del servidor' });
        }
    }

    // ==================== OBTENER MIS ÓRDENES ====================
    async getMyOrders(request: FastifyRequest, reply: FastifyReply) {
        try {
            const user = (request as any).user;

            if (!user?.id) {
                return reply.code(403).send({ success: false, error: 'Usuario no autenticado' });
            }

            const orders = await prisma.order.findMany({
                where: {
                    userId: user.id,
                },
                include: {
                    event: {
                        select: {
                            id: true,
                            name: true,
                            eventDate: true,
                            bannerImage: true,
                        },
                    },
                    locality: {
                        select: {
                            id: true,
                            name: true,
                            price: true,
                        },
                    },
                    tickets: {
                        select: {
                            id: true,
                            ticketCode: true,
                            qrCode: true,
                            status: true,
                            createdAt: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });

            logger.info(`📦 Órdenes encontradas para usuario ${user.id}: ${orders.length}`);
            orders.slice(0, 3).forEach(order => {
                logger.info(
                    `   📋 Orden ${order.id}: status=${order.status}, tickets=${order.tickets.length}`
                );
            });

            return reply.send({
                success: true,
                data: orders,
                total: orders.length,
            });
        } catch (error: any) {
            logger.error({ err: error }, 'Error getting orders:');
            return reply.status(500).send({ success: false, error: 'Error interno del servidor' });
        }
    }

    // ==================== OBTENER ORDEN POR ID ====================
    async getOrderById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        try {
            const user = (request as any).user;
            const { id } = request.params;

            const order = await prisma.order.findUnique({
                where: { id },
                include: {
                    event: {
                        select: {
                            id: true,
                            name: true,
                            eventDate: true,
                            bannerImage: true,
                            venue: {
                                select: {
                                    name: true,
                                    address: true,
                                    city: true,
                                },
                            },
                        },
                    },
                    locality: {
                        select: {
                            id: true,
                            name: true,
                            price: true,
                            description: true,
                        },
                    },
                    tickets: {
                        select: {
                            id: true,
                            ticketCode: true,
                            status: true,
                            qrCode: true,
                            usedAt: true,
                        },
                    },
                },
            });

            if (!order) {
                return reply.code(404).send({ success: false, error: 'Orden no encontrada' });
            }

            // Verificar que la orden pertenece al usuario (o es admin)
            if (
                order.userId !== user.id &&
                !['admin', 'super_admin'].includes(user.role?.toLowerCase())
            ) {
                return reply
                    .code(403)
                    .send({ success: false, error: 'No tienes permiso para ver esta orden' });
            }

            return reply.send({
                success: true,
                data: order,
            });
        } catch (error: any) {
            logger.error({ err: error }, 'Error getting order:');
            return reply.status(500).send({ success: false, error: 'Error interno del servidor' });
        }
    }

    // ==================== ACTUALIZAR ESTADO DE ORDEN (Webhook Stripe) ====================
    async updateOrderStatus(orderId: string, status: OrderStatus, stripePaymentId?: string) {
        try {
            const order = await prisma.$transaction(async tx => {
                const updatedOrder = await tx.order.update({
                    where: { id: orderId },
                    data: {
                        status,
                        stripePaymentId: stripePaymentId || undefined,
                        paidAt: status === OrderStatus.PAID ? new Date() : undefined,
                    },
                });

                // Si el pago fue exitoso, actualizar stock y generar tickets
                if (status === OrderStatus.PAID) {
                    // Si NO venía de reserva, actualizar soldTickets
                    if (!updatedOrder.reservationId) {
                        await tx.eventLocality.update({
                            where: { id: updatedOrder.localityId },
                            data: {
                                soldTickets: { increment: updatedOrder.quantity },
                            },
                        });
                    } else {
                        // Si venía de reserva, mover de reservedTickets a soldTickets
                        await tx.eventLocality.update({
                            where: { id: updatedOrder.localityId },
                            data: {
                                reservedTickets: { decrement: updatedOrder.quantity },
                                soldTickets: { increment: updatedOrder.quantity },
                            },
                        });
                    }

                    // Generar tickets
                    const tickets = [];
                    for (let i = 0; i < updatedOrder.quantity; i++) {
                        const ticketCode = `${updatedOrder.eventId
                            .substring(0, 8)
                            .toUpperCase()}-${Date.now()}-${i + 1}`;

                        const ticket = await tx.ticket.create({
                            data: {
                                orderId: updatedOrder.id,
                                eventId: updatedOrder.eventId,
                                localityId: updatedOrder.localityId,
                                userId: updatedOrder.userId,
                                ticketCode,
                                status: 'VALID',
                            },
                        });

                        tickets.push(ticket);
                    }

                    logger.info(`${tickets.length} tickets generados para orden ${orderId}`);
                }

                // Si el pago falló y NO venía de reserva, liberar stock
                if (status === OrderStatus.FAILED && !updatedOrder.reservationId) {
                    await tx.eventLocality.update({
                        where: { id: updatedOrder.localityId },
                        data: {
                            availableTickets: { increment: updatedOrder.quantity },
                        },
                    });
                }

                return updatedOrder;
            });

            logger.info(`Orden ${orderId} actualizada a estado: ${status}`);
            return { success: true, data: order };
        } catch (error: any) {
            logger.error({ err: error }, 'Error updating order status:');
            return { success: false, error: error.message };
        }
    }

    // ==================== LISTAR TODAS LAS ÓRDENES (ADMIN) ====================
    async getAllOrders(
        request: FastifyRequest<{ Querystring: { status?: string; limit?: string } }>,
        reply: FastifyReply
    ) {
        try {
            const user = (request as any).user;

            // Solo admins pueden ver todas las órdenes
            if (
                !user?.role ||
                !['admin', 'super_admin', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)
            ) {
                return reply.code(403).send({ success: false, error: 'No tienes permisos' });
            }

            const { status, limit } = request.query;
            const limitNum = limit ? parseInt(limit) : 50;

            const orders = await prisma.order.findMany({
                where: status ? { status: status as OrderStatus } : undefined,
                include: {
                    event: {
                        select: {
                            id: true,
                            name: true,
                            eventDate: true,
                        },
                    },
                    locality: {
                        select: {
                            name: true,
                            price: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
                take: limitNum,
            });

            return reply.send({
                success: true,
                data: orders,
                total: orders.length,
            });
        } catch (error: any) {
            logger.error({ err: error }, 'Error getting all orders:');
            return reply.status(500).send({ success: false, error: 'Error interno del servidor' });
        }
    }

    // ==================== PROCESAR PAGO DE ORDEN (Llamado por webhook o demo) ====================
    async processOrderPayment(orderId: string, stripeSessionId: string) {
        try {
            logger.info(`💳 Procesando pago para orden ${orderId}`);

            // 1. Obtener la orden
            const order = await prisma.order.findUnique({
                where: { id: orderId },
                include: {
                    locality: true,
                    reservation: true,
                },
            });

            if (!order) {
                throw new Error('Orden no encontrada');
            }

            if (order.status !== OrderStatus.PENDING) {
                logger.warn(`Orden ${orderId} ya fue procesada (${order.status})`);
                return { message: 'Orden ya procesada', order };
            }

            // 2. Actualizar orden a COMPLETED
            await prisma.order.update({
                where: { id: orderId },
                data: {
                    status: OrderStatus.COMPLETED,
                    stripeSessionId: stripeSessionId,
                    paidAt: new Date(),
                },
            });

            // 3. Actualizar stock de la localidad
            await prisma.eventLocality.update({
                where: { id: order.localityId },
                data: {
                    soldTickets: { increment: order.quantity },
                    availableTickets: { decrement: order.quantity },
                },
            });

            // 4. Si viene de una reserva, marcarla como COMPLETED
            if (order.reservationId) {
                await prisma.reservation.update({
                    where: { id: order.reservationId },
                    data: { status: 'COMPLETED' },
                });

                // Liberar tickets reservados
                await prisma.eventLocality.update({
                    where: { id: order.localityId },
                    data: {
                        reservedTickets: { decrement: order.quantity },
                    },
                });

                logger.info(`✅ Reserva ${order.reservationId} completada`);
            }

            // 5. Generar tickets
            const tickets = [];
            for (let i = 0; i < order.quantity; i++) {
                const ticketCode = `TKT-${Date.now()}-${i + 1}`;
                const ticket = await prisma.ticket.create({
                    data: {
                        ticketCode: ticketCode,
                        orderId: order.id,
                        eventId: order.eventId,
                        localityId: order.localityId,
                        userId: order.userId,
                        qrCode: `TICKET-${order.id}-${i + 1}`,
                        status: 'VALID',
                    },
                });
                tickets.push(ticket);
            }

            logger.info(`✅ Orden ${orderId} completada - ${tickets.length} tickets generados`);

            return {
                order,
                tickets,
                message: 'Pago procesado exitosamente',
            };
        } catch (error: any) {
            logger.error({ err: error }, 'Error processing order payment:');
            throw error;
        }
    }
}

export default new OrderController();
