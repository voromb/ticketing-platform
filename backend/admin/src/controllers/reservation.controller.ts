import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient, ReservationStatus } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// DTOs
interface CreateReservationDTO {
  eventId: string;
  localityId: string;
  quantity: number;
}

class ReservationController {

  // ==================== CREAR RESERVA (SOLO VIP) ====================
  async createReservation(
    request: FastifyRequest<{ Body: CreateReservationDTO }>,
    reply: FastifyReply
  ) {
    try {
      const user = (request as any).user;
      const { eventId, localityId, quantity } = request.body;

      // 1. Verificar que el usuario es VIP
      if (!user?.role || !['vip', 'VIP'].includes(user.role)) {
        return reply.code(403).send({ 
          success: false, 
          error: 'Solo usuarios VIP pueden hacer reservas' 
        });
      }

      // 2. Verificar límite de 3 reservas activas
      const activeReservations = await prisma.reservation.count({
        where: {
          userId: user.id,
          status: ReservationStatus.ACTIVE,
          expiresAt: { gt: new Date() }
        }
      });

      if (activeReservations >= 3) {
        return reply.code(400).send({ 
          success: false, 
          error: 'Ya tienes 3 reservas activas. Cancela o completa alguna antes de crear una nueva.' 
        });
      }

      // 3. Verificar que el evento y localidad existen
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

      // 4. Verificar stock disponible
      if (locality.availableTickets < quantity) {
        return reply.code(400).send({ 
          success: false, 
          error: `Solo hay ${locality.availableTickets} entradas disponibles` 
        });
      }

      // 5. Crear reserva con transacción
      const reservation = await prisma.$transaction(async (tx) => {
        // Crear la reserva (expira en 15 minutos)
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 15);

        const newReservation = await tx.reservation.create({
          data: {
            userId: user.id,
            eventId,
            localityId,
            quantity,
            status: ReservationStatus.ACTIVE,
            expiresAt
          },
          include: {
            event: { select: { name: true } },
            locality: { select: { name: true, price: true } }
          }
        });

        // Actualizar stock de la localidad
        await tx.eventLocality.update({
          where: { id: localityId },
          data: {
            availableTickets: { decrement: quantity },
            reservedTickets: { increment: quantity }
          }
        });

        return newReservation;
      });

      logger.info(`Reserva creada: ${reservation.id} por usuario VIP ${user.id}`);

      // Publicar evento en RabbitMQ
      const { rabbitmqService } = await import('../services/rabbitmq.service');
      await rabbitmqService.publishEvent('reservation.created', {
        reservationId: reservation.id,
        userId: user.id,
        eventId,
        localityId,
        quantity,
        expiresAt: reservation.expiresAt
      });

      return reply.code(201).send({ 
        success: true, 
        data: reservation,
        message: 'Reserva creada exitosamente. Tienes 15 minutos para completar la compra.'
      });

    } catch (error: any) {
      logger.error('Error creating reservation:', error);
      return reply.status(500).send({ success: false, error: 'Error interno del servidor' });
    }
  }

  // ==================== OBTENER MIS RESERVAS ====================
  async getMyReservations(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (request as any).user;

      if (!user?.id) {
        return reply.code(403).send({ success: false, error: 'Usuario no autenticado' });
      }

      const reservations = await prisma.reservation.findMany({
        where: {
          userId: user.id,
          status: { in: [ReservationStatus.ACTIVE, ReservationStatus.COMPLETED] }
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
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Calcular tiempo restante para cada reserva activa
      const reservationsWithTimeLeft = reservations.map(reservation => {
        const timeLeft = reservation.status === ReservationStatus.ACTIVE
          ? Math.max(0, Math.floor((reservation.expiresAt.getTime() - Date.now()) / 1000))
          : 0;

        return {
          ...reservation,
          timeLeftSeconds: timeLeft,
          isExpired: timeLeft === 0 && reservation.status === ReservationStatus.ACTIVE
        };
      });

      return reply.send({ 
        success: true, 
        data: reservationsWithTimeLeft,
        total: reservations.length
      });

    } catch (error: any) {
      logger.error('Error getting reservations:', error);
      return reply.status(500).send({ success: false, error: 'Error interno del servidor' });
    }
  }

  // ==================== CANCELAR RESERVA ====================
  async cancelReservation(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const user = (request as any).user;
      const { id } = request.params;

      if (!user?.id) {
        return reply.code(403).send({ success: false, error: 'Usuario no autenticado' });
      }

      // Buscar la reserva
      const reservation = await prisma.reservation.findUnique({
        where: { id }
      });

      if (!reservation) {
        return reply.code(404).send({ success: false, error: 'Reserva no encontrada' });
      }

      // Verificar que la reserva pertenece al usuario
      if (reservation.userId !== user.id) {
        return reply.code(403).send({ success: false, error: 'No tienes permiso para cancelar esta reserva' });
      }

      // Verificar que la reserva está activa
      if (reservation.status !== ReservationStatus.ACTIVE) {
        return reply.code(400).send({ success: false, error: 'La reserva no está activa' });
      }

      // Cancelar reserva con transacción
      await prisma.$transaction(async (tx) => {
        // Actualizar estado de la reserva
        await tx.reservation.update({
          where: { id },
          data: { status: ReservationStatus.CANCELLED }
        });

        // Liberar stock
        await tx.eventLocality.update({
          where: { id: reservation.localityId },
          data: {
            availableTickets: { increment: reservation.quantity },
            reservedTickets: { decrement: reservation.quantity }
          }
        });
      });

      logger.info(`Reserva cancelada: ${id} por usuario ${user.id}`);

      return reply.send({ 
        success: true, 
        message: 'Reserva cancelada exitosamente. Las entradas han sido liberadas.'
      });

    } catch (error: any) {
      logger.error('Error cancelling reservation:', error);
      return reply.status(500).send({ success: false, error: 'Error interno del servidor' });
    }
  }

  // ==================== CRON JOB: LIBERAR RESERVAS EXPIRADAS ====================
  async expireReservations() {
    try {
      const now = new Date();

      // Buscar reservas activas que ya expiraron
      const expiredReservations = await prisma.reservation.findMany({
        where: {
          status: ReservationStatus.ACTIVE,
          expiresAt: { lt: now }
        }
      });

      if (expiredReservations.length === 0) {
        return { expired: 0 };
      }

      // Expirar reservas y liberar stock
      for (const reservation of expiredReservations) {
        await prisma.$transaction(async (tx) => {
          // Actualizar estado de la reserva
          await tx.reservation.update({
            where: { id: reservation.id },
            data: { status: ReservationStatus.EXPIRED }
          });

          // Liberar stock
          await tx.eventLocality.update({
            where: { id: reservation.localityId },
            data: {
              availableTickets: { increment: reservation.quantity },
              reservedTickets: { decrement: reservation.quantity }
            }
          });
        });

        logger.info(`Reserva expirada automáticamente: ${reservation.id}`);

        // Publicar evento en RabbitMQ
        const { rabbitmqService } = await import('../services/rabbitmq.service');
        await rabbitmqService.publishEvent('reservation.expired', {
          reservationId: reservation.id,
          userId: reservation.userId,
          eventId: reservation.eventId,
          localityId: reservation.localityId,
          quantity: reservation.quantity
        });
      }

      logger.info(`${expiredReservations.length} reservas expiradas y liberadas`);

      return { expired: expiredReservations.length };

    } catch (error: any) {
      logger.error('Error expiring reservations:', error);
      return { expired: 0, error: error.message };
    }
  }

  // ==================== OBTENER RESERVA POR ID ====================
  async getReservationById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const user = (request as any).user;
      const { id } = request.params;

      const reservation = await prisma.reservation.findUnique({
        where: { id },
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

      if (!reservation) {
        return reply.code(404).send({ success: false, error: 'Reserva no encontrada' });
      }

      // Verificar que la reserva pertenece al usuario (o es admin)
      if (reservation.userId !== user.id && !['admin', 'super_admin'].includes(user.role?.toLowerCase())) {
        return reply.code(403).send({ success: false, error: 'No tienes permiso para ver esta reserva' });
      }

      // Calcular tiempo restante
      const timeLeft = reservation.status === ReservationStatus.ACTIVE
        ? Math.max(0, Math.floor((reservation.expiresAt.getTime() - Date.now()) / 1000))
        : 0;

      return reply.send({ 
        success: true, 
        data: {
          ...reservation,
          timeLeftSeconds: timeLeft,
          isExpired: timeLeft === 0 && reservation.status === ReservationStatus.ACTIVE
        }
      });

    } catch (error: any) {
      logger.error('Error getting reservation:', error);
      return reply.status(500).send({ success: false, error: 'Error interno del servidor' });
    }
  }

  // ==================== OBTENER TODAS LAS RESERVAS (ADMIN) ====================
  async getAllReservations(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (request as any).user;

      // Solo admins pueden ver todas las reservas
      if (!user?.role || !['admin', 'super_admin', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
        return reply.code(403).send({ success: false, error: 'No tienes permisos' });
      }

      const reservations = await prisma.reservation.findMany({
        where: {
          status: { in: [ReservationStatus.ACTIVE, ReservationStatus.COMPLETED] }
        },
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
        take: 50
      });

      return reply.send({ 
        success: true, 
        data: reservations,
        total: reservations.length
      });

    } catch (error: any) {
      logger.error('Error getting all reservations:', error);
      return reply.status(500).send({ success: false, error: 'Error interno del servidor' });
    }
  }

}

export default new ReservationController();
