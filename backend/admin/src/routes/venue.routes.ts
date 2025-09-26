import { FastifyInstance } from 'fastify';

export async function venueRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request, reply) => {
    return reply.send({
      message: 'Venues API working',
      venues: []
    });
  });
}
