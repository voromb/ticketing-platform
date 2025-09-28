"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadRoutes = uploadRoutes;
const upload_controller_1 = __importDefault(require("../controllers/upload.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
async function uploadRoutes(fastify) {
    // Middleware de autenticación para todas las rutas
    fastify.addHook('preHandler', auth_middleware_1.authenticateToken);
    // Configurar multipart para upload de archivos
    await fastify.register(require('@fastify/multipart'), {
        limits: {
            fileSize: 5 * 1024 * 1024, // 5MB
            files: 1
        }
    });
    // Subir imagen para evento
    fastify.post('/image', {
        schema: {
            description: 'Subir imagen para evento',
            tags: ['Upload'],
            consumes: ['multipart/form-data'],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: {
                            type: 'object',
                            properties: {
                                filename: { type: 'string' },
                                originalName: { type: 'string' },
                                url: { type: 'string' },
                                size: { type: 'number' },
                                mimetype: { type: 'string' }
                            }
                        },
                        message: { type: 'string' }
                    }
                }
            }
        }
    }, upload_controller_1.default.uploadEventImage);
    // Actualizar imagen de evento específico
    fastify.put('/event/:eventId/image', {
        schema: {
            description: 'Actualizar imagen de evento',
            tags: ['Upload'],
            params: {
                type: 'object',
                properties: {
                    eventId: { type: 'string' }
                },
                required: ['eventId']
            },
            body: {
                type: 'object',
                properties: {
                    imageUrl: { type: 'string' },
                    imageType: { type: 'string', enum: ['banner', 'thumbnail'] }
                },
                required: ['imageUrl', 'imageType']
            }
        }
    }, upload_controller_1.default.updateEventImage);
    // Listar imágenes subidas
    fastify.get('/images', {
        schema: {
            description: 'Listar imágenes subidas',
            tags: ['Upload'],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    filename: { type: 'string' },
                                    url: { type: 'string' },
                                    size: { type: 'number' },
                                    uploadedAt: { type: 'string' }
                                }
                            }
                        },
                        total: { type: 'number' }
                    }
                }
            }
        }
    }, upload_controller_1.default.listImages);
    // Eliminar imagen
    fastify.delete('/image/:filename', {
        schema: {
            description: 'Eliminar imagen',
            tags: ['Upload'],
            params: {
                type: 'object',
                properties: {
                    filename: { type: 'string' }
                },
                required: ['filename']
            }
        }
    }, upload_controller_1.default.deleteImage);
}
