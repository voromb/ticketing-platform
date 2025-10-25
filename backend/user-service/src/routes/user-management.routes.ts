import { Router } from 'express';
import UserManagementController from '../controllers/user-management.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const controller = new UserManagementController();

// ==================== RUTAS PARA ADMIN-SERVICE ====================
// Estas rutas son llamadas desde el admin-service

// GET /api/users - Obtener todos los usuarios
router.get('/', controller.getAllUsers);

// GET /api/users/profile - Obtener perfil del usuario autenticado (ANTES de /:id)
router.get('/profile', authMiddleware, controller.getProfile);

// PUT /api/users/profile - Actualizar perfil del usuario autenticado
router.put('/profile', authMiddleware, controller.updateProfile);

// GET /api/users/:id/with-password - Obtener usuario CON contraseña (solo para promoción)
router.get('/:id/with-password', controller.getUserWithPassword);

// GET /api/users/:id - Obtener usuario por ID
router.get('/:id', controller.getUserById);

// PATCH /api/users/:id/promote - Promocionar usuario a VIP
router.patch('/:id/promote', controller.promoteUserToVip);

// PATCH /api/users/:id/demote - Degradar usuario VIP a normal
router.patch('/:id/demote', controller.demoteVipToUser);

export default router;
