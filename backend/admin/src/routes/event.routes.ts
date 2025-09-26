import { FastifyInstance } from 'fastify';
import SimpleEventController from '../controllers/event.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

export async function eventRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authMiddleware);

  fastify.post('/', SimpleEventController.createRockEvent.bind(SimpleEventController));
  fastify.get('/', SimpleEventController.listRockEvents.bind(SimpleEventController));
  fastify.get('/stats', SimpleEventController.getRockEventStats.bind(SimpleEventController));
  fastify.get('/:id', SimpleEventController.getRockEventById.bind(SimpleEventController));
}
