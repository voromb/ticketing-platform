import { FastifyInstance } from 'fastify';
import { AdminController } from '../controllers/admin.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { RabbitMQService } from '../services/rabbitmq.service';

export async function adminRoutes(fastify: FastifyInstance) {
  // Crear instancia del controlador con RabbitMQ
  const rabbitmqService = new RabbitMQService();
  const adminController = new AdminController(rabbitmqService);

  // Aplicar middleware de autenticación a todas las rutas
  fastify.addHook('preHandler', authMiddleware);

  // ==================== RUTAS CRUD ====================
  
  // GET /api/admins - Listar administradores
  fastify.get('/', adminController.getAll.bind(adminController));
  
  // GET /api/admins/profile - Perfil del admin actual
  fastify.get('/profile', adminController.getProfile.bind(adminController));
  
  // GET /api/admins/stats - Estadísticas de administradores
  fastify.get('/stats', adminController.getStats.bind(adminController));
  
  // GET /api/admins/:id - Obtener admin por ID
  fastify.get('/:id', adminController.getById.bind(adminController));
  
  // POST /api/admins - Crear nuevo administrador
  fastify.post('/', adminController.create.bind(adminController));
  
  // PUT /api/admins/:id - Actualizar administrador completo
  fastify.put('/:id', adminController.update.bind(adminController));
  
  // PATCH /api/admins/:id - Actualizar administrador parcial
  fastify.patch('/:id', adminController.update.bind(adminController));
  
  // ==================== RUTAS ESPECIALES ====================
  
  // POST /api/admins/:id/change-password - Cambiar contraseña
  fastify.post('/:id/change-password', adminController.changePassword.bind(adminController));
  
  // PATCH /api/admins/:id/deactivate - Desactivar administrador
  fastify.patch('/:id/deactivate', adminController.deactivate.bind(adminController));
  
  // PATCH /api/admins/:id/activate - Activar administrador
  fastify.patch('/:id/activate', adminController.activate.bind(adminController));
}
