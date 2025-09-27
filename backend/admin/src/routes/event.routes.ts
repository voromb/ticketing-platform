import { FastifyInstance } from 'fastify';
import SimpleEventController from '../controllers/event.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

export async function eventRoutes(fastify: FastifyInstance) {
  // ==================== RUTAS PÚBLICAS (SIN AUTENTICACIÓN) ====================
  // Para que user-service pueda consultar eventos
  
  // GET /api/events/public - Listar eventos públicos para users
  fastify.get('/public', SimpleEventController.listPublicEvents.bind(SimpleEventController));
  
  // GET /api/events/public/:id - Obtener evento público por ID
  fastify.get('/public/:id', SimpleEventController.getPublicEventById.bind(SimpleEventController));

  // ==================== RUTAS PRIVADAS (CON AUTENTICACIÓN) ====================
  // Para administradores - Registrar rutas con middleware específico
  
  fastify.register(async function (fastify) {
    fastify.addHook('preHandler', authMiddleware);

    fastify.post('/', SimpleEventController.createRockEvent.bind(SimpleEventController));
    fastify.get('/', SimpleEventController.listRockEvents.bind(SimpleEventController));
    fastify.get('/stats', SimpleEventController.getRockEventStats.bind(SimpleEventController));
    fastify.get('/:id', SimpleEventController.getRockEventById.bind(SimpleEventController));
    fastify.put('/:id', SimpleEventController.updateRockEvent.bind(SimpleEventController));
    fastify.patch('/:id', SimpleEventController.updateRockEvent.bind(SimpleEventController));
    fastify.delete('/:id', SimpleEventController.deleteRockEvent.bind(SimpleEventController));
  });
}
