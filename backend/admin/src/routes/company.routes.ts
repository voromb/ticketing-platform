import { FastifyInstance } from 'fastify';
import { companyController } from '../controllers/company.controller';

export async function companyRoutes(fastify: FastifyInstance) {
  // Crear compañía
  fastify.post('/companies', {
    schema: {
      description: 'Crear una nueva compañía',
      tags: ['Companies'],
      body: {
        type: 'object',
        required: ['name', 'type', 'region', 'contactEmail'],
        properties: {
          name: { type: 'string', minLength: 3, maxLength: 100 },
          type: { type: 'string', enum: ['RESTAURANT', 'TRAVEL', 'MERCHANDISING'] },
          region: { type: 'string', enum: ['SPAIN', 'EUROPE', 'AMERICA', 'ASIA', 'AFRICA', 'OCEANIA'] },
          description: { type: 'string', maxLength: 500 },
          contactEmail: { type: 'string', format: 'email' },
          contactPhone: { type: 'string', maxLength: 20 },
          address: { type: 'string', maxLength: 200 },
          taxId: { type: 'string', maxLength: 50 },
          requiresApprovalForCreate: { type: 'boolean' },
          requiresApprovalForDelete: { type: 'boolean' }
        }
      }
    },
    handler: companyController.createCompany.bind(companyController)
  });

  // Estadísticas globales (DEBE IR ANTES de /:id)
  fastify.get('/companies/stats/global', {
    schema: {
      description: 'Obtener estadísticas globales de todas las compañías',
      tags: ['Companies'],
    },
    handler: companyController.getGlobalStats.bind(companyController)
  });

  // Listar compañías
  fastify.get('/companies', {
    schema: {
      description: 'Obtener lista de compañías con filtros opcionales',
      tags: ['Companies'],
      querystring: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['RESTAURANT', 'TRAVEL', 'MERCHANDISING'] },
          region: { type: 'string', enum: ['SPAIN', 'EUROPE', 'AMERICA', 'ASIA', 'AFRICA', 'OCEANIA'] },
          isActive: { type: 'boolean' },
          search: { type: 'string' }
        }
      }
    },
    handler: companyController.getCompanies.bind(companyController)
  });

  // Obtener compañía por ID
  fastify.get('/companies/:id', {
    schema: {
      description: 'Obtener una compañía por ID',
      tags: ['Companies'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' }
        }
      }
    },
    handler: companyController.getCompanyById.bind(companyController)
  });

  // Actualizar compañía
  fastify.patch('/companies/:id', {
    schema: {
      description: 'Actualizar una compañía',
      tags: ['Companies'],
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
          name: { type: 'string', minLength: 3, maxLength: 100 },
          description: { type: 'string', maxLength: 500 },
          contactEmail: { type: 'string', format: 'email' },
          contactPhone: { type: 'string', maxLength: 20 },
          address: { type: 'string', maxLength: 200 },
          taxId: { type: 'string', maxLength: 50 },
          requiresApprovalForCreate: { type: 'boolean' },
          requiresApprovalForDelete: { type: 'boolean' },
          isActive: { type: 'boolean' }
        }
      }
    },
    handler: companyController.updateCompany.bind(companyController)
  });

  // Eliminar compañía
  fastify.delete('/companies/:id', {
    schema: {
      description: 'Desactivar una compañía (soft delete)',
      tags: ['Companies'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' }
        }
      }
    },
    handler: companyController.deleteCompany.bind(companyController)
  });

  // Estadísticas de compañía
  fastify.get('/companies/:id/stats', {
    schema: {
      description: 'Obtener estadísticas de una compañía específica',
      tags: ['Companies'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' }
        }
      }
    },
    handler: companyController.getCompanyStats.bind(companyController)
  });
}
