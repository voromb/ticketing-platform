import { FastifyInstance } from 'fastify';
import UserManagementController from '../controllers/user-management.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

export async function userManagementRoutes(fastify: FastifyInstance) {
  // Aplicar middleware de autenticación a todas las rutas
  fastify.addHook('preHandler', authMiddleware);

  // ==================== RUTAS DE CONSULTA ====================
  
  // GET /api/user-management - Listar usuarios del user-service
  fastify.get('/', UserManagementController.getAllUsers.bind(UserManagementController));
  
  // GET /api/user-management/stats - Estadísticas de usuarios
  fastify.get('/stats', UserManagementController.getUserStats.bind(UserManagementController));
  
  // GET /api/user-management/:id - Obtener usuario por ID
  fastify.get('/:id', UserManagementController.getUserById.bind(UserManagementController));

  // ==================== RUTAS DE GESTIÓN ====================
  
  // POST /api/user-management/:id/promote - Promocionar usuario a VIP
  fastify.post('/:id/promote', UserManagementController.promoteUserToVip.bind(UserManagementController));
  
  // POST /api/user-management/:id/demote - Degradar usuario VIP a normal
  fastify.post('/:id/demote', UserManagementController.demoteVipToUser.bind(UserManagementController));
}
