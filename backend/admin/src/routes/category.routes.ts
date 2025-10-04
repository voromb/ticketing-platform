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
    fastify.get('/stats', getCategoryStats);
    
    // Obtener todas las categorías
    fastify.get('/', getAllCategories);
    
    // Obtener categoría por ID
    fastify.get('/:id', getCategoryById);
    
    // Crear nueva categoría
    fastify.post('/', {
        preHandler: authenticateToken
    }, createCategory);
    
    // Actualizar categoría
    fastify.put('/:id', {
        preHandler: authenticateToken
    }, updateCategory);
    
    // Eliminar categoría
    fastify.delete('/:id', {
        preHandler: authenticateToken
    }, deleteCategory);

    // ============= SUBCATEGORÍAS =============
    
    // Obtener todas las subcategorías
    fastify.get('/subcategories', getAllSubcategories);
    
    // Crear nueva subcategoría
    fastify.post('/subcategories', {
        preHandler: authenticateToken
    }, createSubcategory);
    
    // Actualizar subcategoría
    fastify.put('/subcategories/:id', {
        preHandler: authenticateToken
    }, updateSubcategory);
    
    // Eliminar subcategoría
    fastify.delete('/subcategories/:id', {
        preHandler: authenticateToken
    }, deleteSubcategory);
}
