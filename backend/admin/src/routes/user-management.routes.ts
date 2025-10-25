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
  
  // GET /api/user-management/company-admins - Obtener todos los COMPANY_ADMIN
  fastify.get('/company-admins', UserManagementController.getCompanyAdmins.bind(UserManagementController));
  
  // GET /api/user-management/:id - Obtener usuario por ID
  fastify.get('/:id', UserManagementController.getUserById.bind(UserManagementController));

  // ==================== RUTAS DE GESTIÓN ====================
  
  // POST /api/user-management/:id/promote - Promocionar usuario a VIP
  fastify.post('/:id/promote', UserManagementController.promoteUserToVip.bind(UserManagementController));
  
  // POST /api/user-management/:id/demote - Degradar usuario VIP a normal
  fastify.post('/:id/demote', UserManagementController.demoteVipToUser.bind(UserManagementController));
  
  // POST /api/user-management/:id/promote-company-admin - Promocionar usuario a COMPANY_ADMIN
  fastify.post('/:id/promote-company-admin', UserManagementController.promoteUserToCompanyAdmin.bind(UserManagementController));
  
  // DELETE /api/user-management/company-admins/:id - Degradar COMPANY_ADMIN a usuario normal
  fastify.delete('/company-admins/:id', UserManagementController.demoteCompanyAdmin.bind(UserManagementController));
}
