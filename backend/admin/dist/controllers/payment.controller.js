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
const client_1 = require("@prisma/client");
const stripe_1 = __importDefault(require("stripe"));
const logger_1 = require("../utils/logger");
const prisma = new client_1.PrismaClient();
// Inicializar Stripe (modo test)
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy';
const stripe = new stripe_1.default(STRIPE_KEY, {
    apiVersion: '2024-10-28.acacia',
});
// Flag para modo demo (sin Stripe real)
const DEMO_MODE = !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('ABCDEFG');
class PaymentController {
    // ==================== CREAR SESIÓN DE CHECKOUT STRIPE ====================
    async createCheckoutSession(request, reply) {
        try {
            const user = request.user;
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
            if (order.status !== client_1.OrderStatus.PENDING) {
                return reply.code(400).send({ success: false, error: 'La orden ya fue procesada' });
            }
            // MODO DEMO: Si no hay clave real de Stripe, usar checkout interno
            if (DEMO_MODE) {
                logger_1.logger.warn('[PAYMENT] MODO DEMO: Usando checkout interno sin Stripe real');
                const checkoutUrl = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/payment/checkout?orderId=${orderId}`;
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
                            unit_amount: Math.round((Number(order.finalAmount) * 100) / order.quantity), // Precio en céntimos por unidad
                        },
                        quantity: order.quantity,
                    },
                ],
                mode: 'payment',
                success_url: `${process.env.FRONTEND_URL || 'http://localhost:4200'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
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
            logger_1.logger.info(`Sesión Stripe creada: ${session.id} para orden ${orderId}`);
            return reply.send({
                success: true,
                data: {
                    sessionId: session.id,
                    url: session.url,
                },
            });
        }
        catch (error) {
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
    async completeDemoPayment(request, reply) {
        logger_1.logger.info('[PAYMENT]� ENDPOINT /complete-payment LLAMADO');
        try {
            const user = request.user;
            const { orderId } = request.body;
            logger_1.logger.info(`[PAYMENT]� Usuario: ${user?.id || 'NO AUTENTICADO'}`);
            logger_1.logger.info(`[PAYMENT] OrderId recibido: ${orderId || 'NO RECIBIDO'}`);
            if (!user?.id) {
                logger_1.logger.error('[PAYMENT] Usuario no autenticado');
                return reply.code(403).send({ success: false, error: 'Usuario no autenticado' });
            }
            if (!orderId) {
                logger_1.logger.error('[PAYMENT] orderId no proporcionado');
                return reply.code(400).send({ success: false, error: 'orderId requerido' });
            }
            logger_1.logger.info(`[PAYMENT]� DEMO: Iniciando pago para orden ${orderId}`);
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
            if (order.status !== client_1.OrderStatus.PENDING) {
                return reply.code(400).send({ success: false, error: 'La orden ya fue procesada' });
            }
            logger_1.logger.info(`[PAYMENT]� Orden encontrada: ${order.quantity} tickets para ${order.event.name}`);
            // 2. Actualizar orden a PAID
            const updatedOrder = await prisma.order.update({
                where: { id: orderId },
                data: {
                    status: client_1.OrderStatus.PAID,
                    stripeSessionId: 'demo_session_' + orderId,
                    paidAt: new Date(),
                },
            });
            logger_1.logger.info(`[PAYMENT] Orden actualizada a PAID`);
            logger_1.logger.info(`[PAYMENT] Verificación: Orden ${updatedOrder.id} ahora tiene status: ${updatedOrder.status}`);
            // 3. Actualizar stock de la localidad
            await prisma.eventLocality.update({
                where: { id: order.localityId },
                data: {
                    soldTickets: { increment: order.quantity },
                    availableTickets: { decrement: order.quantity },
                },
            });
            logger_1.logger.info(`[PAYMENT] Stock actualizado: -${order.quantity} disponibles, +${order.quantity} vendidos`);
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
                logger_1.logger.info(`[PAYMENT]� Reserva ${order.reservationId} completada y liberada`);
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
            logger_1.logger.info(`[PAYMENT]� ${tickets.length} tickets generados exitosamente`);
            return reply.send({
                success: true,
                data: {
                    order,
                    tickets,
                    message: 'Pago procesado exitosamente',
                },
            });
        }
        catch (error) {
            logger_1.logger.error('[PAYMENT] Error completing demo payment:', error);
            logger_1.logger.error('Error message:', error.message);
            logger_1.logger.error('Error stack:', error.stack);
            return reply.status(500).send({
                success: false,
                error: 'Error al procesar pago demo',
                details: error.message,
            });
        }
    }
    // ==================== WEBHOOK DE STRIPE ====================
    async handleWebhook(request, reply) {
        try {
            const sig = request.headers['stripe-signature'];
            const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
            if (!webhookSecret) {
                logger_1.logger.error('STRIPE_WEBHOOK_SECRET no configurado');
                return reply.code(400).send({ error: 'Webhook secret no configurado' });
            }
            let event;
            try {
                event = stripe.webhooks.constructEvent(request.body, sig, webhookSecret);
            }
            catch (err) {
                logger_1.logger.error('Error verificando webhook:', err.message);
                return reply.code(400).send({ error: `Webhook Error: ${err.message}` });
            }
            // Manejar el evento
            switch (event.type) {
                case 'checkout.session.completed': {
                    const session = event.data.object;
                    const orderId = session.client_reference_id || session.metadata?.orderId;
                    if (!orderId) {
                        logger_1.logger.error('Orden ID no encontrado en webhook');
                        break;
                    }
                    logger_1.logger.info(`Pago completado para orden: ${orderId}`);
                    // Actualizar orden a PAID y generar tickets
                    const result = await OrderController.updateOrderStatus(orderId, client_1.OrderStatus.PAID, session.payment_intent);
                    // Publicar evento en RabbitMQ
                    const { rabbitmqService } = await Promise.resolve().then(() => __importStar(require('../services/rabbitmq.service')));
                    await rabbitmqService.publishEvent('payment.completed', {
                        orderId,
                        userId: session.metadata?.userId,
                        eventId: session.metadata?.eventId,
                        amount: session.amount_total ? session.amount_total / 100 : 0,
                        currency: session.currency,
                        paymentIntent: session.payment_intent,
                    });
                    logger_1.logger.info(`[PAYMENT] Evento publicado: payment.completed para orden ${orderId}`);
                    break;
                }
                case 'checkout.session.expired': {
                    const session = event.data.object;
                    const orderId = session.client_reference_id || session.metadata?.orderId;
                    if (!orderId) {
                        logger_1.logger.error('Orden ID no encontrado en webhook');
                        break;
                    }
                    logger_1.logger.info(`Sesión expirada para orden: ${orderId}`);
                    // Actualizar orden a FAILED
                    await OrderController.updateOrderStatus(orderId, client_1.OrderStatus.FAILED);
                    break;
                }
                case 'payment_intent.payment_failed': {
                    const paymentIntent = event.data.object;
                    // Buscar orden por payment intent
                    const order = await prisma.order.findFirst({
                        where: { stripePaymentId: paymentIntent.id },
                    });
                    if (order) {
                        logger_1.logger.info(`Pago fallido para orden: ${order.id}`);
                        await OrderController.updateOrderStatus(order.id, client_1.OrderStatus.FAILED);
                    }
                    break;
                }
                default:
                    logger_1.logger.info(`Evento no manejado: ${event.type}`);
            }
            return reply.send({ received: true });
        }
        catch (error) {
            logger_1.logger.error('Error handling webhook:', error);
            return reply.status(500).send({ error: 'Error procesando webhook' });
        }
    }
    // ==================== VERIFICAR ESTADO DE PAGO ====================
    async checkPaymentStatus(request, reply) {
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
        }
        catch (error) {
            logger_1.logger.error('Error checking payment status:', error);
            return reply
                .status(500)
                .send({ success: false, error: 'Error verificando estado de pago' });
        }
    }
}
exports.default = new PaymentController();
