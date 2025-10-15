import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middlewares/auth.middleware';
import EventController from '../controllers/event.controller';

export async function eventRoutes(fastify: FastifyInstance) {
    // Rutas públicas de eventos
    fastify.get('/public', {
        schema: {
            tags: ['Events'],
            summary: 'Obtener lista pública de eventos',
            description: 'Obtiene todos los eventos públicos disponibles'
        }
    }, EventController.listRockEvents.bind(EventController));
    
    fastify.get('/public/:id', {
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
    }, EventController.getEventById.bind(EventController));

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
    }, EventController.getEventLocalities.bind(EventController));

    // Rutas protegidas de eventos
    fastify.register(async function (fastify) {
        // Aplicar middleware de autenticación
        fastify.addHook('preHandler', authMiddleware);

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
                        date: { type: 'string', format: 'date-time', description: 'Fecha del evento' },
                        venueId: { type: 'string', description: 'ID del venue' },
                        categoryId: { type: 'string', description: 'ID de la categoría' },
                        subcategoryId: { type: 'string', description: 'ID de la subcategoría (opcional)' },
                        price: { type: 'number', description: 'Precio del evento' },
                        capacity: { type: 'integer', description: 'Capacidad máxima' },
                        status: { type: 'string', enum: ['draft', 'published', 'cancelled'], description: 'Estado del evento' }
                    }
                }
            }
        }, EventController.createEvent.bind(EventController));

        // Listar eventos (admin)
        fastify.get('/', {
            schema: {
                tags: ['Events'],
                summary: 'Listar todos los eventos (admin)',
                description: 'Obtiene todos los eventos incluidos los no publicados (requiere autenticación)',
                security: [{ bearerAuth: [] }]
            }
        }, EventController.listRockEvents.bind(EventController));

        // Obtener evento por ID (admin)
        fastify.get('/:id', {
            schema: {
                tags: ['Events'],
                summary: 'Obtener evento por ID (admin)',
                description: 'Obtiene los detalles completos de un evento (requiere autenticación)',
                security: [{ bearerAuth: [] }],
                params: {
                    type: 'object',
                    required: ['id'],
                    properties: {
                        id: { type: 'string', description: 'ID del evento' }
                    }
                }
            }
        }, EventController.getEventById.bind(EventController));

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
                        id: { type: 'string', description: 'ID del evento' }
                    }
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
                        status: { type: 'string', enum: ['draft', 'published', 'cancelled'] }
                    }
                }
            }
        }, EventController.updateEvent.bind(EventController));

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
        }, EventController.deleteEvent.bind(EventController));
    });
}