import { FastifyInstance } from 'fastify';

export async function adminRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request, reply) => {
    return reply.send({
      message: 'Admins API working',
      admins: []
    });
  });
}
