import { FastifyInstance } from 'fastify';

export async function eventRoutes(fastify: FastifyInstance) {
  // Por ahora sin autenticación hasta que esté listo
  // TODO: Añadir authMiddleware cuando esté funcionando
  
  fastify.get('/', async (request, reply) => {
    return reply.send({
      message: 'Events API working',
      endpoints: [
        'GET /api/events',
        'POST /api/events',
        'GET /api/events/:id',
        'PUT /api/events/:id',
        'DELETE /api/events/:id'
      ]
    });
  });

  fastify.get('/test', async (request, reply) => {
    return { status: 'Events route is working!' };
  });
}
