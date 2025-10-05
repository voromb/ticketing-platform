import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient, OrderStatus } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// DTOs
interface CreateOrderDTO {
  eventId: string;
  localityId: string;
  quantity: number;
  reservationId?: string; // Opcional: si viene de una reserva
}

class OrderController {

  // ==================== CREAR ORDEN ====================
  async createOrder(
    request: FastifyRequest<{ Body: CreateOrderDTO }>,
    reply: FastifyReply
  ) {
    try {
      const user = (request as any).user;
      const { eventId, localityId, quantity, reservationId } = request.body;

      if (!user?.id || !user?.email) {
        return reply.code(403).send({ success: false, error: 'Usuario no autenticado' });
      }

      // 1. Verificar que el evento y localidad existen
      const locality = await prisma.eventLocality.findUnique({
        where: { id: localityId },
        include: { event: true }
      });

      if (!locality) {
        return reply.code(404).send({ success: false, error: 'Localidad no encontrada' });
      }

      if (locality.eventId !== eventId) {
        return reply.code(400).send({ success: false, error: 'La localidad no pertenece a este evento' });
      }

      if (!locality.isActive) {
        return reply.code(400).send({ success: false, error: 'La localidad no está activa' });
      }

      // 2. Si viene de una reserva, verificar que existe y pertenece al usuario
      let reservation = null;
      if (reservationId) {
        reservation = await prisma.reservation.findUnique({
          where: { id: reservationId }
        });

        if (!reservation) {
          return reply.code(404).send({ success: false, error: 'Reserva no encontrada' });
        }

        if (reservation.userId !== user.id) {
          return reply.code(403).send({ success: false, error: 'La reserva no te pertenece' });
        }

        if (reservation.status !== 'ACTIVE') {
          return reply.code(400).send({ success: false, error: 'La reserva no está activa' });
        }

        // Verificar que no haya expirado
        if (reservation.expiresAt < new Date()) {
          return reply.code(400).send({ success: false, error: 'La reserva ha expirado' });
        }
      } else {
        // 3. Si NO viene de reserva, verificar stock disponible
        if (locality.availableTickets < quantity) {
          return reply.code(400).send({ 
            success: false, 
            error: `Solo hay ${locality.availableTickets} entradas disponibles` 
          });
        }
      }

      // 4. Calcular precios
      const unitPrice = Number(locality.price);
      const totalAmount = unitPrice * quantity;
      
      // Aplicar descuento VIP (10%)
      const isVip = user.role && ['vip', 'VIP'].includes(user.role);
      const discount = isVip ? totalAmount * 0.10 : 0;
      const finalAmount = totalAmount - discount;

      // 5. Crear orden con transacción
      const order = await prisma.$transaction(async (tx) => {
        const newOrder = await tx.order.create({
          data: {
            userId: user.id,
            userEmail: user.email,
            eventId,
            localityId,
            quantity,
            totalAmount,
            discount,
            finalAmount,
            status: OrderStatus.PENDING,
            reservationId: reservationId || null
          },
          include: {
            event: {
              select: {
                id: true,
                name: true,
                eventDate: true,
                bannerImage: true
              }
            },
            locality: {
              select: {
                id: true,
                name: true,
                price: true
              }
            }
          }
        });

        // Si NO viene de reserva, actualizar stock inmediatamente
        if (!reservationId) {
          await tx.eventLocality.update({
            where: { id: localityId },
            data: {
              availableTickets: { decrement: quantity }
            }
          });
        }

        // Si viene de reserva, marcar la reserva como completada
        if (reservationId) {
          await tx.reservation.update({
            where: { id: reservationId },
            data: { status: 'COMPLETED' }
          });
        }

        return newOrder;
      });

      logger.info(`Orden creada: ${order.id} por usuario ${user.id} (VIP: ${isVip})`);

      return reply.code(201).send({ 
        success: true, 
        data: order,
        message: 'Orden creada exitosamente'
      });

    } catch (error: any) {
      logger.error('Error creating order:', error);
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
          userId: user.id
        },
        include: {
          event: {
            select: {
              id: true,
              name: true,
              eventDate: true,
              bannerImage: true
            }
          },
          locality: {
            select: {
              id: true,
              name: true,
              price: true
            }
          },
          tickets: {
            select: {
              id: true,
              ticketCode: true,
              qrCode: true,
              status: true,
              createdAt: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      logger.info(`📦 Órdenes encontradas para usuario ${user.id}: ${orders.length}`);
      orders.slice(0, 3).forEach(order => {
        logger.info(`   📋 Orden ${order.id}: status=${order.status}, tickets=${order.tickets.length}`);
      });

      return reply.send({ 
        success: true, 
        data: orders,
        total: orders.length
      });

    } catch (error: any) {
      logger.error('Error getting orders:', error);
      return reply.status(500).send({ success: false, error: 'Error interno del servidor' });
    }
  }

  // ==================== OBTENER ORDEN POR ID ====================
  async getOrderById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
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
                  city: true
                }
              }
            }
          },
          locality: {
            select: {
              id: true,
              name: true,
              price: true,
              description: true
            }
          },
          tickets: {
            select: {
              id: true,
              ticketCode: true,
              status: true,
              qrCode: true,
              usedAt: true
            }
          }
        }
      });

      if (!order) {
        return reply.code(404).send({ success: false, error: 'Orden no encontrada' });
      }

      // Verificar que la orden pertenece al usuario (o es admin)
      if (order.userId !== user.id && !['admin', 'super_admin'].includes(user.role?.toLowerCase())) {
        return reply.code(403).send({ success: false, error: 'No tienes permiso para ver esta orden' });
      }

      return reply.send({ 
        success: true, 
        data: order
      });

    } catch (error: any) {
      logger.error('Error getting order:', error);
      return reply.status(500).send({ success: false, error: 'Error interno del servidor' });
    }
  }

  // ==================== ACTUALIZAR ESTADO DE ORDEN (Webhook Stripe) ====================
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    stripePaymentId?: string
  ) {
    try {
      const order = await prisma.$transaction(async (tx) => {
        const updatedOrder = await tx.order.update({
          where: { id: orderId },
          data: {
            status,
            stripePaymentId: stripePaymentId || undefined,
            paidAt: status === OrderStatus.PAID ? new Date() : undefined
          }
        });

        // Si el pago fue exitoso, actualizar stock y generar tickets
        if (status === OrderStatus.PAID) {
          // Si NO venía de reserva, actualizar soldTickets
          if (!updatedOrder.reservationId) {
            await tx.eventLocality.update({
              where: { id: updatedOrder.localityId },
              data: {
                soldTickets: { increment: updatedOrder.quantity }
              }
            });
          } else {
            // Si venía de reserva, mover de reservedTickets a soldTickets
            await tx.eventLocality.update({
              where: { id: updatedOrder.localityId },
              data: {
                reservedTickets: { decrement: updatedOrder.quantity },
                soldTickets: { increment: updatedOrder.quantity }
              }
            });
          }

          // Generar tickets
          const tickets = [];
          for (let i = 0; i < updatedOrder.quantity; i++) {
            const ticketCode = `${updatedOrder.eventId.substring(0, 8).toUpperCase()}-${Date.now()}-${i + 1}`;
            
            const ticket = await tx.ticket.create({
              data: {
                orderId: updatedOrder.id,
                eventId: updatedOrder.eventId,
                localityId: updatedOrder.localityId,
                userId: updatedOrder.userId,
                ticketCode,
                status: 'VALID'
              }
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
              availableTickets: { increment: updatedOrder.quantity }
            }
          });
        }

        return updatedOrder;
      });

      logger.info(`Orden ${orderId} actualizada a estado: ${status}`);
      return { success: true, data: order };

    } catch (error: any) {
      logger.error('Error updating order status:', error);
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
      if (!user?.role || !['admin', 'super_admin', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
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
              eventDate: true
            }
          },
          locality: {
            select: {
              name: true,
              price: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limitNum
      });

      return reply.send({ 
        success: true, 
        data: orders,
        total: orders.length
      });

    } catch (error: any) {
      logger.error('Error getting all orders:', error);
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
          reservation: true
        }
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
          paidAt: new Date()
        }
      });

      // 3. Actualizar stock de la localidad
      await prisma.eventLocality.update({
        where: { id: order.localityId },
        data: {
          soldTickets: { increment: order.quantity },
          availableTickets: { decrement: order.quantity }
        }
      });

      // 4. Si viene de una reserva, marcarla como COMPLETED
      if (order.reservationId) {
        await prisma.reservation.update({
          where: { id: order.reservationId },
          data: { status: 'COMPLETED' }
        });

        // Liberar tickets reservados
        await prisma.eventLocality.update({
          where: { id: order.localityId },
          data: {
            reservedTickets: { decrement: order.quantity }
          }
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
            status: 'VALID'
          }
        });
        tickets.push(ticket);
      }

      logger.info(`✅ Orden ${orderId} completada - ${tickets.length} tickets generados`);

      return {
        order,
        tickets,
        message: 'Pago procesado exitosamente'
      };

    } catch (error: any) {
      logger.error('Error processing order payment:', error);
      throw error;
    }
  }

}

export default new OrderController();
