import { FastifyInstance } from 'fastify';
import { companyAdminController } from '../controllers/company-admin.controller';

export async function companyAdminRoutes(fastify: FastifyInstance) {
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
    handler: companyAdminController.createCompanyAdmin.bind(companyAdminController)
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
    handler: companyAdminController.getCompanyAdmins.bind(companyAdminController)
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
    handler: companyAdminController.getCompanyAdminById.bind(companyAdminController)
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
    handler: companyAdminController.updateCompanyAdmin.bind(companyAdminController)
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
    handler: companyAdminController.updatePermissions.bind(companyAdminController)
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
    handler: companyAdminController.resetPassword.bind(companyAdminController)
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
    handler: companyAdminController.deleteCompanyAdmin.bind(companyAdminController)
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
    handler: companyAdminController.getAdminsByCompany.bind(companyAdminController)
  });
}
