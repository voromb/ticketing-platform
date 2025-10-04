import { FastifyInstance } from 'fastify';
import EventController from '../controllers/event.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

export async function eventRoutes(fastify: FastifyInstance) {
  // ==================== RUTAS PÚBLICAS ====================
  fastify.get('/public', EventController.listRockEvents.bind(EventController)); // lista pública de eventos
  fastify.get('/public/:id', EventController.getEventById.bind(EventController));
  fastify.get('/:id/localities', EventController.getEventLocalities.bind(EventController)); // Localidades públicas

  // ==================== RUTAS PRIVADAS ====================
  fastify.register(async function (fastify) {
    fastify.addHook('preHandler', authMiddleware);

    fastify.post('/', EventController.createEvent.bind(EventController));
    fastify.get('/', EventController.listRockEvents.bind(EventController)); // lista filtrando por rock/metal
    fastify.get('/:id', EventController.getEventById.bind(EventController));
    fastify.put('/:id', EventController.updateEvent.bind(EventController));
    fastify.patch('/:id', EventController.updateEvent.bind(EventController));
    fastify.delete('/:id', EventController.deleteEvent.bind(EventController));
  });
}
