import { FastifyInstance } from 'fastify';
import ReservationController from '../controllers/reservation.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

export async function reservationRoutes(fastify: FastifyInstance) {
  
  // ==================== RUTAS PRIVADAS (Requieren autenticación) ====================
  fastify.register(async (fastify) => {
    fastify.addHook('preHandler', authMiddleware);

    // Crear reserva (solo VIP)
    fastify.post('/', ReservationController.createReservation.bind(ReservationController));

    // Obtener mis reservas
    fastify.get('/my-reservations', ReservationController.getMyReservations.bind(ReservationController));

    // Obtener todas las reservas (solo admin) - ANTES de /:id
    fastify.get('/all', ReservationController.getAllReservations.bind(ReservationController));

    // Obtener reserva por ID
    fastify.get('/:id', ReservationController.getReservationById.bind(ReservationController));

    // Cancelar reserva
    fastify.delete('/:id', ReservationController.cancelReservation.bind(ReservationController));
  });
}
