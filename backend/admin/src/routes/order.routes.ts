import { FastifyInstance } from 'fastify';
import OrderController from '../controllers/order.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

export async function orderRoutes(fastify: FastifyInstance) {
  
  // ==================== RUTAS PRIVADAS (Requieren autenticación) ====================
  fastify.register(async (fastify) => {
    fastify.addHook('preHandler', authMiddleware);

    // Crear orden
    fastify.post('/', OrderController.createOrder.bind(OrderController));

    // Obtener mis órdenes
    fastify.get('/my-orders', OrderController.getMyOrders.bind(OrderController));

    // Obtener orden por ID
    fastify.get('/:id', OrderController.getOrderById.bind(OrderController));

    // Listar todas las órdenes (solo admin)
    fastify.get('/', OrderController.getAllOrders.bind(OrderController));
  });
}
