"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userManagementRoutes = userManagementRoutes;
const user_management_controller_1 = __importDefault(require("../controllers/user-management.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
async function userManagementRoutes(fastify) {
    // Aplicar middleware de autenticación a todas las rutas
    fastify.addHook('preHandler', auth_middleware_1.authMiddleware);
    // ==================== RUTAS DE CONSULTA ====================
    // GET /api/user-management - Listar usuarios del user-service
    fastify.get('/', user_management_controller_1.default.getAllUsers.bind(user_management_controller_1.default));
    // GET /api/user-management/stats - Estadísticas de usuarios
    fastify.get('/stats', user_management_controller_1.default.getUserStats.bind(user_management_controller_1.default));
    // GET /api/user-management/company-admins - Obtener todos los COMPANY_ADMIN
    fastify.get('/company-admins', user_management_controller_1.default.getCompanyAdmins.bind(user_management_controller_1.default));
    // GET /api/user-management/:id - Obtener usuario por ID
    fastify.get('/:id', user_management_controller_1.default.getUserById.bind(user_management_controller_1.default));
    // ==================== RUTAS DE GESTIÓN ====================
    // POST /api/user-management/:id/promote - Promocionar usuario a VIP
    fastify.post('/:id/promote', user_management_controller_1.default.promoteUserToVip.bind(user_management_controller_1.default));
    // POST /api/user-management/:id/demote - Degradar usuario VIP a normal
    fastify.post('/:id/demote', user_management_controller_1.default.demoteVipToUser.bind(user_management_controller_1.default));
    // POST /api/user-management/:id/promote-company-admin - Promocionar usuario a COMPANY_ADMIN
    fastify.post('/:id/promote-company-admin', user_management_controller_1.default.promoteUserToCompanyAdmin.bind(user_management_controller_1.default));
    // DELETE /api/user-management/company-admins/:id - Degradar COMPANY_ADMIN a usuario normal
    fastify.delete('/company-admins/:id', user_management_controller_1.default.demoteCompanyAdmin.bind(user_management_controller_1.default));
}
