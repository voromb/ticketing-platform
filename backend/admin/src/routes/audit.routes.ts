import { FastifyInstance } from 'fastify';

export async function auditRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request, reply) => {
    return reply.send({
      message: 'Audit API working',
      logs: []
    });
  });
}
