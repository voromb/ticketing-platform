import { FastifyInstance } from 'fastify';
import {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    getAllSubcategories,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
    getCategoryStats,
} from '../controllers/category.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

export async function categoryRoutes(fastify: FastifyInstance) {
    // ============= CATEGORÍAS =============
    
    // Obtener estadísticas de categorías
    fastify.get('/stats', {
        schema: {
            tags: ['Categories'],
            summary: 'Obtener estadísticas de categorías',
            description: 'Obtiene estadísticas generales de las categorías'
        }
    }, getCategoryStats);
    
    // Obtener todas las categorías
    fastify.get('/', {
        schema: {
            tags: ['Categories'],
            summary: 'Listar todas las categorías',
            description: 'Obtiene la lista completa de categorías disponibles'
        }
    }, getAllCategories);
    
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
    }, getCategoryById);
    
    // Crear nueva categoría
    fastify.post('/', {
        preHandler: authenticateToken,
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
    }, createCategory);
    
    // Actualizar categoría
    fastify.put('/:id', {
        preHandler: authenticateToken,
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
    }, updateCategory);
    
    // Eliminar categoría
    fastify.delete('/:id', {
        preHandler: authenticateToken,
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
    }, deleteCategory);

    // ============= SUBCATEGORÍAS =============
    
    // Obtener todas las subcategorías
    fastify.get('/subcategories', {
        schema: {
            tags: ['Subcategories'],
            summary: 'Listar todas las subcategorías',
            description: 'Obtiene la lista completa de subcategorías disponibles'
        }
    }, getAllSubcategories);
    
    // Crear nueva subcategoría
    fastify.post('/subcategories', {
        preHandler: authenticateToken,
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
    }, createSubcategory);
    
    // Actualizar subcategoría
    fastify.put('/subcategories/:id', {
        preHandler: authenticateToken,
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
    }, updateSubcategory);
    
    // Eliminar subcategoría
    fastify.delete('/subcategories/:id', {
        preHandler: authenticateToken,
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
    }, deleteSubcategory);
}