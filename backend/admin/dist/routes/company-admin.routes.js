"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyAdminRoutes = companyAdminRoutes;
const company_admin_controller_1 = require("../controllers/company-admin.controller");
async function companyAdminRoutes(fastify) {
    // Crear admin de compañía
    fastify.post('/company-admins', {
        schema: {
            description: 'Crear un nuevo administrador de compañía',
            tags: ['Company Admins'],
            body: {
                type: 'object',
                required: ['email', 'password', 'firstName', 'lastName', 'companyId'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 8, maxLength: 100 },
                    firstName: { type: 'string', minLength: 2, maxLength: 50 },
                    lastName: { type: 'string', minLength: 2, maxLength: 50 },
                    phone: { type: 'string', maxLength: 20 },
                    companyId: { type: 'string', format: 'uuid' },
                    canCreate: { type: 'boolean' },
                    canUpdate: { type: 'boolean' },
                    canDelete: { type: 'boolean' },
                    canViewStats: { type: 'boolean' },
                    canManageStock: { type: 'boolean' }
                }
            }
        },
        handler: company_admin_controller_1.companyAdminController.createCompanyAdmin.bind(company_admin_controller_1.companyAdminController)
    });
    // Listar admins
    fastify.get('/company-admins', {
        schema: {
            description: 'Obtener lista de administradores con filtros opcionales',
            tags: ['Company Admins'],
            querystring: {
                type: 'object',
                properties: {
                    companyId: { type: 'string', format: 'uuid' },
                    isActive: { type: 'boolean' },
                    search: { type: 'string' }
                }
            }
        },
        handler: company_admin_controller_1.companyAdminController.getCompanyAdmins.bind(company_admin_controller_1.companyAdminController)
    });
    // Obtener admin por ID
    fastify.get('/company-admins/:id', {
        schema: {
            description: 'Obtener un administrador por ID',
            tags: ['Company Admins'],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', format: 'uuid' }
                }
            }
        },
        handler: company_admin_controller_1.companyAdminController.getCompanyAdminById.bind(company_admin_controller_1.companyAdminController)
    });
    // Actualizar admin
    fastify.patch('/company-admins/:id', {
        schema: {
            description: 'Actualizar un administrador',
            tags: ['Company Admins'],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', format: 'uuid' }
                }
            },
            body: {
                type: 'object',
                properties: {
                    firstName: { type: 'string', minLength: 2, maxLength: 50 },
                    lastName: { type: 'string', minLength: 2, maxLength: 50 },
                    phone: { type: 'string', maxLength: 20 },
                    canCreate: { type: 'boolean' },
                    canUpdate: { type: 'boolean' },
                    canDelete: { type: 'boolean' },
                    canViewStats: { type: 'boolean' },
                    canManageStock: { type: 'boolean' },
                    isActive: { type: 'boolean' }
                }
            }
        },
        handler: company_admin_controller_1.companyAdminController.updateCompanyAdmin.bind(company_admin_controller_1.companyAdminController)
    });
    // Actualizar permisos
    fastify.patch('/company-admins/:id/permissions', {
        schema: {
            description: 'Actualizar permisos de un administrador',
            tags: ['Company Admins'],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', format: 'uuid' }
                }
            },
            body: {
                type: 'object',
                required: ['canCreate', 'canUpdate', 'canDelete', 'canViewStats', 'canManageStock'],
                properties: {
                    canCreate: { type: 'boolean' },
                    canUpdate: { type: 'boolean' },
                    canDelete: { type: 'boolean' },
                    canViewStats: { type: 'boolean' },
                    canManageStock: { type: 'boolean' }
                }
            }
        },
        handler: company_admin_controller_1.companyAdminController.updatePermissions.bind(company_admin_controller_1.companyAdminController)
    });
    // Reset password
    fastify.post('/company-admins/:id/reset-password', {
        schema: {
            description: 'Resetear contraseña de un administrador',
            tags: ['Company Admins'],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', format: 'uuid' }
                }
            },
            body: {
                type: 'object',
                required: ['newPassword'],
                properties: {
                    newPassword: { type: 'string', minLength: 8, maxLength: 100 }
                }
            }
        },
        handler: company_admin_controller_1.companyAdminController.resetPassword.bind(company_admin_controller_1.companyAdminController)
    });
    // Eliminar admin
    fastify.delete('/company-admins/:id', {
        schema: {
            description: 'Desactivar un administrador (soft delete)',
            tags: ['Company Admins'],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', format: 'uuid' }
                }
            }
        },
        handler: company_admin_controller_1.companyAdminController.deleteCompanyAdmin.bind(company_admin_controller_1.companyAdminController)
    });
    // Obtener admins por compañía
    fastify.get('/companies/:companyId/admins', {
        schema: {
            description: 'Obtener todos los administradores de una compañía',
            tags: ['Company Admins'],
            params: {
                type: 'object',
                required: ['companyId'],
                properties: {
                    companyId: { type: 'string', format: 'uuid' }
                }
            }
        },
        handler: company_admin_controller_1.companyAdminController.getAdminsByCompany.bind(company_admin_controller_1.companyAdminController)
    });
}
