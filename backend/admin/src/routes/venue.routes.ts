import { FastifyInstance } from 'fastify';
import { VenueController } from '../controllers/venue.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const venueController = new VenueController({
  publishEvent: () => Promise.resolve(),
  isConnected: () => false,
  connect: () => Promise.resolve(),
  close: () => Promise.resolve()
} as any);

export async function venueRoutes(fastify: FastifyInstance) {
  fastify.get('/', venueController.getAll.bind(venueController));
  fastify.get('/:id', venueController.getById.bind(venueController));
  fastify.post('/', {
    preHandler: authMiddleware
  }, venueController.create.bind(venueController));
  fastify.put('/:id', {
    preHandler: authMiddleware
  }, venueController.update.bind(venueController));
  fastify.patch('/:id', {
    preHandler: authMiddleware
  }, venueController.update.bind(venueController));
  fastify.delete('/:id', {
    preHandler: authMiddleware
  }, venueController.delete.bind(venueController));
}
