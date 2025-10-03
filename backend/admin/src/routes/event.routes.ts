import { FastifyInstance } from 'fastify';
import EventController from '../controllers/event.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

export async function eventRoutes(fastify: FastifyInstance) {

  // ==================== RUTAS PÚBLICAS ====================
  fastify.get('/public/:id', EventController.getEventById);
  fastify.get('/public', EventController.listRockEvents);
  fastify.get('/public/categories', EventController.listCategories);
  fastify.get('/public/categories/available', EventController.listAvailableCategories);

  // ==================== RUTAS PRIVADAS ====================
  fastify.register(async function (fastify) {
    fastify.addHook('preHandler', authMiddleware);

    fastify.post('/', EventController.createEvent);
    fastify.get('/', EventController.listRockEvents);
    fastify.get('/:id', EventController.getEventById);
    fastify.put('/:id', EventController.updateEvent);
    fastify.patch('/:id', EventController.updateEvent);
    fastify.delete('/:id', EventController.deleteEvent);
  });
}
