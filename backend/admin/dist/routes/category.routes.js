"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryRoutes = categoryRoutes;
const category_controller_1 = require("../controllers/category.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
async function categoryRoutes(fastify) {
    // ============= CATEGORÍAS =============
    // Obtener estadísticas de categorías
    fastify.get('/stats', {
        schema: {
            tags: ['Categories'],
            summary: 'Obtener estadísticas de categorías',
            description: 'Obtiene estadísticas generales de las categorías'
        }
    }, category_controller_1.getCategoryStats);
    // Obtener todas las categorías
    fastify.get('/', {
        schema: {
            tags: ['Categories'],
            summary: 'Listar todas las categorías',
            description: 'Obtiene la lista completa de categorías disponibles'
        }
    }, category_controller_1.getAllCategories);
    // Obtener categoría por ID
    fastify.get('/:id', {
        schema: {
            tags: ['Categories'],
            summary: 'Obtener categoría por ID',
            description: 'Obtiene los detalles de una categoría específica',
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', description: 'ID de la categoría' }
                }
            }
        }
    }, category_controller_1.getCategoryById);
    // Crear nueva categoría
    fastify.post('/', {
        preHandler: auth_middleware_1.authenticateToken,
        schema: {
            tags: ['Categories'],
            summary: 'Crear nueva categoría',
            description: 'Crea una nueva categoría (requiere autenticación)',
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['name'],
                properties: {
                    name: { type: 'string', description: 'Nombre de la categoría' },
                    description: { type: 'string', description: 'Descripción de la categoría' },
                    imageUrl: { type: 'string', format: 'uri', description: 'URL de la imagen' }
                }
            }
        }
    }, category_controller_1.createCategory);
    // Actualizar categoría
    fastify.put('/:id', {
        preHandler: auth_middleware_1.authenticateToken,
        schema: {
            tags: ['Categories'],
            summary: 'Actualizar categoría',
            description: 'Actualiza una categoría existente (requiere autenticación)',
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', description: 'ID de la categoría' }
                }
            },
            body: {
                type: 'object',
                properties: {
                    name: { type: 'string', description: 'Nombre de la categoría' },
                    description: { type: 'string', description: 'Descripción de la categoría' },
                    imageUrl: { type: 'string', format: 'uri', description: 'URL de la imagen' }
                }
            }
        }
    }, category_controller_1.updateCategory);
    // Eliminar categoría
    fastify.delete('/:id', {
        preHandler: auth_middleware_1.authenticateToken,
        schema: {
            tags: ['Categories'],
            summary: 'Eliminar categoría',
            description: 'Elimina una categoría permanentemente (requiere autenticación)',
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', description: 'ID de la categoría' }
                }
            }
        }
    }, category_controller_1.deleteCategory);
    // ============= SUBCATEGORÍAS =============
    // Obtener todas las subcategorías
    fastify.get('/subcategories', {
        schema: {
            tags: ['Subcategories'],
            summary: 'Listar todas las subcategorías',
            description: 'Obtiene la lista completa de subcategorías disponibles'
        }
    }, category_controller_1.getAllSubcategories);
    // Crear nueva subcategoría
    fastify.post('/subcategories', {
        preHandler: auth_middleware_1.authenticateToken,
        schema: {
            tags: ['Subcategories'],
            summary: 'Crear nueva subcategoría',
            description: 'Crea una nueva subcategoría (requiere autenticación)',
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['name', 'categoryId'],
                properties: {
                    name: { type: 'string', description: 'Nombre de la subcategoría' },
                    categoryId: { type: 'string', description: 'ID de la categoría padre' },
                    description: { type: 'string', description: 'Descripción de la subcategoría' },
                    imageUrl: { type: 'string', format: 'uri', description: 'URL de la imagen' }
                }
            }
        }
    }, category_controller_1.createSubcategory);
    // Actualizar subcategoría
    fastify.put('/subcategories/:id', {
        preHandler: auth_middleware_1.authenticateToken,
        schema: {
            tags: ['Subcategories'],
            summary: 'Actualizar subcategoría',
            description: 'Actualiza una subcategoría existente (requiere autenticación)',
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', description: 'ID de la subcategoría' }
                }
            },
            body: {
                type: 'object',
                properties: {
                    name: { type: 'string', description: 'Nombre de la subcategoría' },
                    categoryId: { type: 'string', description: 'ID de la categoría padre' },
                    description: { type: 'string', description: 'Descripción de la subcategoría' },
                    imageUrl: { type: 'string', format: 'uri', description: 'URL de la imagen' }
                }
            }
        }
    }, category_controller_1.updateSubcategory);
    // Eliminar subcategoría
    fastify.delete('/subcategories/:id', {
        preHandler: auth_middleware_1.authenticateToken,
        schema: {
            tags: ['Subcategories'],
            summary: 'Eliminar subcategoría',
            description: 'Elimina una subcategoría permanentemente (requiere autenticación)',
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', description: 'ID de la subcategoría' }
                }
            }
        }
    }, category_controller_1.deleteSubcategory);
}
