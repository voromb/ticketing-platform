import { Router } from 'express';
import UserManagementController from '../controllers/user-management.controller';

const router = Router();
const controller = new UserManagementController();

// ==================== RUTAS PARA ADMIN-SERVICE ====================
// Estas rutas son llamadas desde el admin-service

// GET /api/users - Obtener todos los usuarios
router.get('/', controller.getAllUsers);

// GET /api/users/:id - Obtener usuario por ID
router.get('/:id', controller.getUserById);

// PATCH /api/users/:id/promote - Promocionar usuario a VIP
router.patch('/:id/promote', controller.promoteUserToVip);

// PATCH /api/users/:id/demote - Degradar usuario VIP a normal
router.patch('/:id/demote', controller.demoteVipToUser);

export default router;
