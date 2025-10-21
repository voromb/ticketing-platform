"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventRoutes = eventRoutes;
const auth_middleware_1 = require("../middlewares/auth.middleware");
const event_controller_1 = __importDefault(require("../controllers/event.controller"));
async function eventRoutes(fastify) {
    // Rutas públicas de eventos (acceso sin autenticación)
    fastify.get('/', {
        schema: {
            tags: ['Events'],
            summary: 'Obtener lista pública de eventos',
            description: 'Obtiene todos los eventos públicos disponibles'
        }
    }, event_controller_1.default.listRockEvents.bind(event_controller_1.default));
    fastify.get('/:id', {
        schema: {
            tags: ['Events'],
            summary: 'Obtener evento público por ID',
            description: 'Obtiene los detalles de un evento específico',
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', description: 'ID del evento' }
                }
            }
        }
    }, event_controller_1.default.getEventById.bind(event_controller_1.default));
    fastify.get('/:id/localities', {
        schema: {
            tags: ['Events'],
            summary: 'Obtener localidades de un evento',
            description: 'Obtiene las localidades disponibles para un evento',
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', description: 'ID del evento' }
                }
            }
        }
    }, event_controller_1.default.getEventLocalities.bind(event_controller_1.default));
    // Rutas protegidas de eventos (requieren autenticación)
    fastify.register(async function (fastify) {
        // Aplicar middleware de autenticación
        fastify.addHook('preHandler', auth_middleware_1.authMiddleware);
        // Crear evento
        fastify.post('/', {
            schema: {
                tags: ['Events'],
                summary: 'Crear nuevo evento',
                description: 'Crea un nuevo evento (requiere autenticación de admin)',
                security: [{ bearerAuth: [] }],
                body: {
                    type: 'object',
                    required: ['title', 'description', 'date', 'venueId', 'categoryId'],
                    properties: {
                        title: { type: 'string', description: 'Título del evento' },
                        description: { type: 'string', description: 'Descripción del evento' },
                        date: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Fecha del evento',
                        },
                        venueId: { type: 'string', description: 'ID del venue' },
                        categoryId: { type: 'string', description: 'ID de la categoría' },
                        subcategoryId: {
                            type: 'string',
                            description: 'ID de la subcategoría (opcional)',
                        },
                        price: { type: 'number', description: 'Precio del evento' },
                        capacity: { type: 'integer', description: 'Capacidad máxima' },
                        status: {
                            type: 'string',
                            enum: [
                                'DRAFT',
                                'ACTIVE',
                                'SOLD_OUT',
                                'CANCELLED',
                                'COMPLETED',
                                'SUSPENDED',
                            ],
                            description: 'Estado del evento',
                        },
                    },
                },
            },
        }, event_controller_1.default.createEvent.bind(event_controller_1.default));
        // Listar eventos (admin) - incluye todos los estados
        fastify.get('/admin/all', {
            schema: {
                tags: ['Events'],
                summary: 'Listar todos los eventos (admin)',
                description: 'Obtiene todos los eventos incluidos los no publicados (requiere autenticación)',
                security: [{ bearerAuth: [] }],
            },
        }, event_controller_1.default.listRockEvents.bind(event_controller_1.default));
        // Obtener evento por ID (admin) - incluye datos completos
        fastify.get('/admin/:id', {
            schema: {
                tags: ['Events'],
                summary: 'Obtener evento por ID (admin)',
                description: 'Obtiene los detalles completos de un evento (requiere autenticación)',
                security: [{ bearerAuth: [] }],
                params: {
                    type: 'object',
                    required: ['id'],
                    properties: {
                        id: { type: 'string', description: 'ID del evento' },
                    },
                },
            },
        }, event_controller_1.default.getEventById.bind(event_controller_1.default));
        // Actualizar evento
        fastify.put('/:id', {
            schema: {
                tags: ['Events'],
                summary: 'Actualizar evento completo',
                description: 'Actualiza todos los campos de un evento (requiere autenticación)',
                security: [{ bearerAuth: [] }],
                params: {
                    type: 'object',
                    required: ['id'],
                    properties: {
                        id: { type: 'string', description: 'ID del evento' },
                    },
                },
                body: {
                    type: 'object',
                    properties: {
                        title: { type: 'string' },
                        description: { type: 'string' },
                        date: { type: 'string', format: 'date-time' },
                        venueId: { type: 'string' },
                        categoryId: { type: 'string' },
                        subcategoryId: { type: 'string' },
                        price: { type: 'number' },
                        capacity: { type: 'integer' },
                        status: {
                            type: 'string',
                            enum: [
                                'DRAFT',
                                'ACTIVE',
                                'SOLD_OUT',
                                'CANCELLED',
                                'COMPLETED',
                                'SUSPENDED',
                            ],
                        },
                    },
                },
            },
        }, event_controller_1.default.updateEvent.bind(event_controller_1.default));
        // Eliminar evento
        fastify.delete('/:id', {
            schema: {
                tags: ['Events'],
                summary: 'Eliminar evento',
                description: 'Elimina un evento permanentemente (requiere autenticación)',
                security: [{ bearerAuth: [] }],
                params: {
                    type: 'object',
                    required: ['id'],
                    properties: {
                        id: { type: 'string', description: 'ID del evento' }
                    }
                }
            }
        }, event_controller_1.default.deleteEvent.bind(event_controller_1.default));
    });
}
