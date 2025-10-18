"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRoutes = adminRoutes;
const admin_controller_1 = require("../controllers/admin.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rabbitmq_service_1 = require("../services/rabbitmq.service");
async function adminRoutes(fastify) {
    // Crear instancia del controlador con RabbitMQ
    const rabbitmqService = new rabbitmq_service_1.RabbitMQService();
    const adminController = new admin_controller_1.AdminController(rabbitmqService);
    // Aplicar middleware de autenticación a todas las rutas
    fastify.addHook('preHandler', auth_middleware_1.authMiddleware);
    // ==================== RUTAS CRUD ====================
    // GET /api/admins - Listar administradores
    fastify.get('/', {
        schema: {
            tags: ['Admins'],
            summary: 'Listar administradores',
            description: 'Obtiene la lista de todos los administradores del sistema',
            security: [{ bearerAuth: [] }]
        }
    }, adminController.getAll.bind(adminController));
    // GET /api/admins/profile - Perfil del admin actual
    fastify.get('/profile', {
        schema: {
            tags: ['Admins'],
            summary: 'Perfil del administrador actual',
            description: 'Obtiene el perfil del administrador autenticado',
            security: [{ bearerAuth: [] }]
        }
    }, adminController.getProfile.bind(adminController));
    // GET /api/admins/stats - Estadísticas de administradores
    fastify.get('/stats', {
        schema: {
            tags: ['Admins'],
            summary: 'Estadísticas de administradores',
            description: 'Obtiene estadísticas generales de los administradores',
            security: [{ bearerAuth: [] }]
        }
    }, adminController.getStats.bind(adminController));
    // GET /api/admins/:id - Obtener admin por ID
    fastify.get('/:id', {
        schema: {
            tags: ['Admins'],
            summary: 'Obtener administrador por ID',
            description: 'Obtiene los detalles de un administrador específico',
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', description: 'ID del administrador' }
                }
            }
        }
    }, adminController.getById.bind(adminController));
    // POST /api/admins - Crear nuevo administrador
    fastify.post('/', {
        schema: {
            tags: ['Admins'],
            summary: 'Crear nuevo administrador',
            description: 'Crea un nuevo administrador en el sistema',
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['email', 'password', 'name'],
                properties: {
                    email: { type: 'string', format: 'email', description: 'Email del administrador' },
                    password: { type: 'string', minLength: 6, description: 'Contraseña del administrador' },
                    name: { type: 'string', description: 'Nombre completo del administrador' },
                    role: { type: 'string', enum: ['admin', 'super_admin'], description: 'Rol del administrador' }
                }
            }
        }
    }, adminController.create.bind(adminController));
    // PUT /api/admins/:id - Actualizar administrador completo
    fastify.put('/:id', {
        schema: {
            tags: ['Admins'],
            summary: 'Actualizar administrador completo',
            description: 'Actualiza todos los campos de un administrador',
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', description: 'ID del administrador' }
                }
            },
            body: {
                type: 'object',
                properties: {
                    email: { type: 'string', format: 'email' },
                    name: { type: 'string' },
                    role: { type: 'string', enum: ['admin', 'super_admin'] }
                }
            }
        }
    }, adminController.update.bind(adminController));
    // PATCH /api/admins/:id - Actualizar administrador parcial
    fastify.patch('/:id', {
        schema: {
            tags: ['Admins'],
            summary: 'Actualizar administrador parcial',
            description: 'Actualiza campos específicos de un administrador',
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', description: 'ID del administrador' }
                }
            },
            body: {
                type: 'object',
                properties: {
                    email: { type: 'string', format: 'email' },
                    name: { type: 'string' },
                    role: { type: 'string', enum: ['admin', 'super_admin'] }
                }
            }
        }
    }, adminController.update.bind(adminController));
    // ==================== RUTAS ESPECIALES ====================
    // POST /api/admins/:id/change-password - Cambiar contraseña
    fastify.post('/:id/change-password', {
        schema: {
            tags: ['Admins'],
            summary: 'Cambiar contraseña de administrador',
            description: 'Cambia la contraseña de un administrador específico',
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', description: 'ID del administrador' }
                }
            },
            body: {
                type: 'object',
                required: ['currentPassword', 'newPassword'],
                properties: {
                    currentPassword: { type: 'string', description: 'Contraseña actual' },
                    newPassword: { type: 'string', minLength: 6, description: 'Nueva contraseña' }
                }
            }
        }
    }, adminController.changePassword.bind(adminController));
    // PATCH /api/admins/:id/deactivate - Desactivar administrador
    fastify.patch('/:id/deactivate', {
        schema: {
            tags: ['Admins'],
            summary: 'Desactivar administrador',
            description: 'Desactiva un administrador temporalmente',
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', description: 'ID del administrador' }
                }
            }
        }
    }, adminController.deactivate.bind(adminController));
    // PATCH /api/admins/:id/activate - Activar administrador
    fastify.patch('/:id/activate', {
        schema: {
            tags: ['Admins'],
            summary: 'Activar administrador',
            description: 'Activa un administrador previamente desactivado',
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', description: 'ID del administrador' }
                }
            }
        }
    }, adminController.activate.bind(adminController));
}
