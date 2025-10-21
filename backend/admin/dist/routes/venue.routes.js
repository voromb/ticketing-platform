"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.venueRoutes = venueRoutes;
const auth_middleware_1 = require("../middlewares/auth.middleware");
const venue_controller_1 = __importDefault(require("../controllers/venue.controller"));
async function venueRoutes(fastify) {
    // Rutas públicas de venues (acceso sin autenticación)
    fastify.get('/', {
        schema: {
            tags: ['Venues'],
            summary: 'Obtener lista pública de venues',
            description: 'Obtiene todos los venues activos disponibles'
        }
    }, venue_controller_1.default.getAll.bind(venue_controller_1.default));
    fastify.get('/:id', {
        schema: {
            tags: ['Venues'],
            summary: 'Obtener venue público por ID',
            description: 'Obtiene los detalles de un venue específico',
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', description: 'ID del venue' }
                }
            }
        }
    }, venue_controller_1.default.getById.bind(venue_controller_1.default));
    // Rutas protegidas de venues (requieren autenticación)
    fastify.register(async function (fastify) {
        // Aplicar middleware de autenticación
        fastify.addHook('preHandler', auth_middleware_1.authMiddleware);
        // Crear venue
        fastify.post('/', {
            schema: {
                tags: ['Venues'],
                summary: 'Crear nuevo venue',
                description: 'Crea un nuevo venue (requiere autenticación de admin)',
                security: [{ bearerAuth: [] }],
                body: {
                    type: 'object',
                    required: ['name', 'address', 'city', 'country', 'capacity'],
                    properties: {
                        name: { type: 'string', description: 'Nombre del venue' },
                        slug: { type: 'string', description: 'Slug único del venue' },
                        address: { type: 'string', description: 'Dirección del venue' },
                        city: { type: 'string', description: 'Ciudad' },
                        state: { type: 'string', description: 'Estado/provincia' },
                        country: { type: 'string', description: 'País' },
                        postalCode: { type: 'string', description: 'Código postal' },
                        capacity: { type: 'integer', description: 'Capacidad máxima' },
                        description: { type: 'string', description: 'Descripción del venue' },
                        phone: { type: 'string', description: 'Teléfono de contacto' },
                        email: { type: 'string', format: 'email', description: 'Email de contacto' },
                        website: { type: 'string', format: 'uri', description: 'Sitio web' },
                        latitude: { type: 'number', description: 'Coordenada de latitud' },
                        longitude: { type: 'number', description: 'Coordenada de longitud' }
                    }
                }
            }
        }, venue_controller_1.default.create.bind(venue_controller_1.default));
        // Listar todos los venues (admin) - incluye inactivos
        fastify.get('/admin/all', {
            schema: {
                tags: ['Venues'],
                summary: 'Listar todos los venues (admin)',
                description: 'Obtiene todos los venues incluidos los inactivos (requiere autenticación)',
                security: [{ bearerAuth: [] }]
            }
        }, venue_controller_1.default.getAll.bind(venue_controller_1.default));
        // Obtener venue por ID (admin) - incluye datos completos
        fastify.get('/admin/:id', {
            schema: {
                tags: ['Venues'],
                summary: 'Obtener venue por ID (admin)',
                description: 'Obtiene los detalles completos de un venue (requiere autenticación)',
                security: [{ bearerAuth: [] }],
                params: {
                    type: 'object',
                    required: ['id'],
                    properties: {
                        id: { type: 'string', description: 'ID del venue' }
                    }
                }
            }
        }, venue_controller_1.default.getById.bind(venue_controller_1.default));
        // Obtener estadísticas del venue
        fastify.get('/:id/stats', {
            schema: {
                tags: ['Venues'],
                summary: 'Obtener estadísticas del venue',
                description: 'Obtiene estadísticas de uso del venue (requiere autenticación)',
                security: [{ bearerAuth: [] }],
                params: {
                    type: 'object',
                    required: ['id'],
                    properties: {
                        id: { type: 'string', description: 'ID del venue' }
                    }
                }
            }
        }, venue_controller_1.default.getStats.bind(venue_controller_1.default));
        // Actualizar venue
        fastify.put('/:id', {
            schema: {
                tags: ['Venues'],
                summary: 'Actualizar venue completo',
                description: 'Actualiza todos los campos de un venue (requiere autenticación)',
                security: [{ bearerAuth: [] }],
                params: {
                    type: 'object',
                    required: ['id'],
                    properties: {
                        id: { type: 'string', description: 'ID del venue' }
                    }
                },
                body: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        slug: { type: 'string' },
                        address: { type: 'string' },
                        city: { type: 'string' },
                        state: { type: 'string' },
                        country: { type: 'string' },
                        postalCode: { type: 'string' },
                        capacity: { type: 'integer' },
                        description: { type: 'string' },
                        phone: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        website: { type: 'string', format: 'uri' },
                        latitude: { type: 'number' },
                        longitude: { type: 'number' }
                    }
                }
            }
        }, venue_controller_1.default.update.bind(venue_controller_1.default));
        // Activar venue
        fastify.patch('/:id/activate', {
            schema: {
                tags: ['Venues'],
                summary: 'Activar venue',
                description: 'Activa un venue desactivado (requiere autenticación)',
                security: [{ bearerAuth: [] }],
                params: {
                    type: 'object',
                    required: ['id'],
                    properties: {
                        id: { type: 'string', description: 'ID del venue' }
                    }
                }
            }
        }, venue_controller_1.default.activate.bind(venue_controller_1.default));
        // Desactivar venue
        fastify.patch('/:id/deactivate', {
            schema: {
                tags: ['Venues'],
                summary: 'Desactivar venue',
                description: 'Desactiva un venue temporalmente (requiere autenticación)',
                security: [{ bearerAuth: [] }],
                params: {
                    type: 'object',
                    required: ['id'],
                    properties: {
                        id: { type: 'string', description: 'ID del venue' }
                    }
                }
            }
        }, venue_controller_1.default.deactivate.bind(venue_controller_1.default));
        // Eliminar venue
        fastify.delete('/:id', {
            schema: {
                tags: ['Venues'],
                summary: 'Eliminar venue',
                description: 'Elimina un venue permanentemente (requiere autenticación)',
                security: [{ bearerAuth: [] }],
                params: {
                    type: 'object',
                    required: ['id'],
                    properties: {
                        id: { type: 'string', description: 'ID del venue' }
                    }
                }
            }
        }, venue_controller_1.default.delete.bind(venue_controller_1.default));
    });
}
