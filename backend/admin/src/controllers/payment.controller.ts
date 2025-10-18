// @ts-nocheck - Legacy file with type issues, to be refactored
import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient, OrderStatus } from '@prisma/client';
import Stripe from 'stripe';
import { logger } from '../utils/logger';
import orderController from './order.controller';

const prisma = new PrismaClient();

// Inicializar Stripe (modo test)
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy';
const stripe = new Stripe(STRIPE_KEY, {
    apiVersion: '2024-10-28.acacia',
});

// Flag para modo demo (sin Stripe real)
const DEMO_MODE =
    !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('ABCDEFG');

// DTOs
interface CreateCheckoutDTO {
    orderId: string;
}

class PaymentController {
    // ==================== CREAR SESIÓN DE CHECKOUT STRIPE ====================
    async createCheckoutSession(
        request: FastifyRequest<{ Body: CreateCheckoutDTO }>,
        reply: FastifyReply
    ) {
        try {
            const user = (request as any).user;
            const { orderId } = request.body;

            if (!user?.id) {
                return reply.code(403).send({ success: false, error: 'Usuario no autenticado' });
            }

            // 1. Obtener la orden
            const order = await prisma.order.findUnique({
                where: { id: orderId },
                include: {
                    event: {
                        select: {
                            name: true,
                            eventDate: true,
                            bannerImage: true,
                        },
                    },
                    locality: {
                        select: {
                            name: true,
                        },
                    },
                },
            });

            if (!order) {
                return reply.code(404).send({ success: false, error: 'Orden no encontrada' });
            }

            // Verificar que la orden pertenece al usuario
            if (order.userId !== user.id) {
                return reply.code(403).send({ success: false, error: 'La orden no te pertenece' });
            }

            // Verificar que la orden está pendiente
            if (order.status !== OrderStatus.PENDING) {
                return reply.code(400).send({ success: false, error: 'La orden ya fue procesada' });
            }

            // MODO DEMO: Si no hay clave real de Stripe, usar checkout interno
            if (DEMO_MODE) {
                logger.warn('[PAYMENT] MODO DEMO: Usando checkout interno sin Stripe real');

                const checkoutUrl = `${
                    process.env.FRONTEND_URL || 'http://localhost:4200'
                }/payment/checkout?orderId=${orderId}`;

                return reply.send({
                    success: true,
                    data: {
                        sessionId: 'checkout_' + orderId,
                        url: checkoutUrl,
                    },
                });
            }

            // 2. Crear sesión de Stripe
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'eur',
                            product_data: {
                                name: `${order.event.name} - ${order.locality.name}`,
                                description: `${order.quantity} entrada(s) para ${order.event.name}`,
                                images: order.event.bannerImage ? [order.event.bannerImage] : [],
                            },
                            unit_amount: Math.round(
                                (Number(order.finalAmount) * 100) / order.quantity
                            ), // Precio en céntimos por unidad
                        },
                        quantity: order.quantity,
                    },
                ],
                mode: 'payment',
                success_url: `${
                    process.env.FRONTEND_URL || 'http://localhost:4200'
                }/payment/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:4200'}/payment/cancel`,
                client_reference_id: orderId,
                customer_email: order.userEmail,
                metadata: {
                    orderId: order.id,
                    userId: order.userId,
                    eventId: order.eventId,
                    localityId: order.localityId,
                    quantity: order.quantity.toString(),
                    isVip: user.role && ['vip', 'VIP'].includes(user.role) ? 'true' : 'false',
                },
            });

            // 3. Actualizar orden con el session ID
            await prisma.order.update({
                where: { id: orderId },
                data: { stripeSessionId: session.id },
            });

            logger.info(`Sesión Stripe creada: ${session.id} para orden ${orderId}`);

            return reply.send({
                success: true,
                data: {
                    sessionId: session.id,
                    url: session.url,
                },
            });
        } catch (error: any) {
            return reply
                .status(500)
                .send({
                    success: false,
                    error: 'Error al crear sesión de pago',
                    details: error.message,
                });
        }
    }

    // ==================== COMPLETAR PAGO (Modo Interno) ====================
    async completeDemoPayment(
        request: FastifyRequest<{ Body: { orderId: string } }>,
        reply: FastifyReply
    ) {
        logger.info('[PAYMENT]� ENDPOINT /complete-payment LLAMADO');
        try {
            const user = (request as any).user;
            const { orderId } = request.body;

            logger.info(`[PAYMENT]� Usuario: ${user?.id || 'NO AUTENTICADO'}`);
            logger.info(`[PAYMENT] OrderId recibido: ${orderId || 'NO RECIBIDO'}`);

            if (!user?.id) {
                logger.error('[PAYMENT] Usuario no autenticado');
                return reply.code(403).send({ success: false, error: 'Usuario no autenticado' });
            }

            if (!orderId) {
                logger.error('[PAYMENT] orderId no proporcionado');
                return reply.code(400).send({ success: false, error: 'orderId requerido' });
            }

            logger.info(`[PAYMENT]� DEMO: Iniciando pago para orden ${orderId}`);
            // 1. Obtener la orden
            const order = await prisma.order.findUnique({
                where: { id: orderId },
                include: {
                    locality: true,
                    reservation: true,
                    event: true,
                },
            });

            if (!order) {
                return reply.code(404).send({ success: false, error: 'Orden no encontrada' });
            }

            if (order.status !== OrderStatus.PENDING) {
                return reply.code(400).send({ success: false, error: 'La orden ya fue procesada' });
            }

            logger.info(
                `[PAYMENT]� Orden encontrada: ${order.quantity} tickets para ${order.event.name}`
            );

            // 2. Actualizar orden a PAID
            const updatedOrder = await prisma.order.update({
                where: { id: orderId },
                data: {
                    status: OrderStatus.PAID,
                    stripeSessionId: 'demo_session_' + orderId,
                    paidAt: new Date(),
                },
            });

            logger.info(`[PAYMENT] Orden actualizada a PAID`);
            logger.info(
                `[PAYMENT] Verificación: Orden ${updatedOrder.id} ahora tiene status: ${updatedOrder.status}`
            );

            // 3. Actualizar stock de la localidad
            await prisma.eventLocality.update({
                where: { id: order.localityId },
                data: {
                    soldTickets: { increment: order.quantity },
                    availableTickets: { decrement: order.quantity },
                },
            });

            logger.info(
                `[PAYMENT] Stock actualizado: -${order.quantity} disponibles, +${order.quantity} vendidos`
            );

            // 4. Si viene de una reserva, marcarla como COMPLETED
            if (order.reservationId) {
                await prisma.reservation.update({
                    where: { id: order.reservationId },
                    data: { status: 'COMPLETED' },
                });

                await prisma.eventLocality.update({
                    where: { id: order.localityId },
                    data: {
                        reservedTickets: { decrement: order.quantity },
                    },
                });

                logger.info(`[PAYMENT]� Reserva ${order.reservationId} completada y liberada`);
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

            logger.info(`[PAYMENT]� ${tickets.length} tickets generados exitosamente`);

            return reply.send({
                success: true,
                data: {
                    order,
                    tickets,
                    message: 'Pago procesado exitosamente',
                },
            });
        } catch (error: any) {
            logger.error('[PAYMENT] Error completing demo payment:', error);
            logger.error('Error message:', error.message);
            logger.error('Error stack:', error.stack);
            return reply.status(500).send({
                success: false,
                error: 'Error al procesar pago demo',
                details: error.message,
            });
        }
    }

    // ==================== WEBHOOK DE STRIPE ====================
    async handleWebhook(request: FastifyRequest, reply: FastifyReply) {
        try {
            const sig = request.headers['stripe-signature'] as string;
            const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

            if (!webhookSecret) {
                logger.error('STRIPE_WEBHOOK_SECRET no configurado');
                return reply.code(400).send({ error: 'Webhook secret no configurado' });
            }

            let event: Stripe.Event;

            try {
                event = stripe.webhooks.constructEvent(request.body as Buffer, sig, webhookSecret);
            } catch (err: any) {
                logger.error('Error verificando webhook:', err.message);
                return reply.code(400).send({ error: `Webhook Error: ${err.message}` });
            }

            // Manejar el evento
            switch (event.type) {
                case 'checkout.session.completed': {
                    const session = event.data.object as Stripe.Checkout.Session;
                    const orderId = session.client_reference_id || session.metadata?.orderId;

                    if (!orderId) {
                        logger.error('Orden ID no encontrado en webhook');
                        break;
                    }

                    logger.info(`Pago completado para orden: ${orderId}`);

                    // Actualizar orden a PAID y generar tickets
                    const result = await OrderController.updateOrderStatus(
                        orderId,
                        OrderStatus.PAID,
                        session.payment_intent as string
                    );

                    // Publicar evento en RabbitMQ
                    const { rabbitmqService } = await import('../services/rabbitmq.service');
                    await rabbitmqService.publishEvent('payment.completed', {
                        orderId,
                        userId: session.metadata?.userId,
                        eventId: session.metadata?.eventId,
                        amount: session.amount_total ? session.amount_total / 100 : 0,
                        currency: session.currency,
                        paymentIntent: session.payment_intent,
                    });

                    logger.info(
                        `[PAYMENT] Evento publicado: payment.completed para orden ${orderId}`
                    );

                    break;
                }

                case 'checkout.session.expired': {
                    const session = event.data.object as Stripe.Checkout.Session;
                    const orderId = session.client_reference_id || session.metadata?.orderId;

                    if (!orderId) {
                        logger.error('Orden ID no encontrado en webhook');
                        break;
                    }

                    logger.info(`Sesión expirada para orden: ${orderId}`);

                    // Actualizar orden a FAILED
                    await OrderController.updateOrderStatus(orderId, OrderStatus.FAILED);

                    break;
                }

                case 'payment_intent.payment_failed': {
                    const paymentIntent = event.data.object as Stripe.PaymentIntent;

                    // Buscar orden por payment intent
                    const order = await prisma.order.findFirst({
                        where: { stripePaymentId: paymentIntent.id },
                    });

                    if (order) {
                        logger.info(`Pago fallido para orden: ${order.id}`);
                        await OrderController.updateOrderStatus(order.id, OrderStatus.FAILED);
                    }

                    break;
                }

                default:
                    logger.info(`Evento no manejado: ${event.type}`);
            }

            return reply.send({ received: true });
        } catch (error: any) {
            logger.error('Error handling webhook:', error);
            return reply.status(500).send({ error: 'Error procesando webhook' });
        }
    }

    // ==================== VERIFICAR ESTADO DE PAGO ====================
    async checkPaymentStatus(
        request: FastifyRequest<{ Params: { sessionId: string } }>,
        reply: FastifyReply
    ) {
        try {
            const { sessionId } = request.params;

            // Obtener sesión de Stripe
            const session = await stripe.checkout.sessions.retrieve(sessionId);

            // Buscar orden asociada
            const order = await prisma.order.findUnique({
                where: { stripeSessionId: sessionId },
                include: {
                    event: {
                        select: {
                            name: true,
                            eventDate: true,
                        },
                    },
                    locality: {
                        select: {
                            name: true,
                        },
                    },
                    tickets: {
                        select: {
                            ticketCode: true,
                            status: true,
                        },
                    },
                },
            });

            if (!order) {
                return reply.code(404).send({ success: false, error: 'Orden no encontrada' });
            }

            return reply.send({
                success: true,
                data: {
                    order,
                    paymentStatus: session.payment_status,
                    sessionStatus: session.status,
                },
            });
        } catch (error: any) {
            logger.error('Error checking payment status:', error);
            return reply
                .status(500)
                .send({ success: false, error: 'Error verificando estado de pago' });
        }
    }
}

export default new PaymentController();
