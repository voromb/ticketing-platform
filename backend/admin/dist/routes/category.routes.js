"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryRoutes = categoryRoutes;
const category_controller_1 = require("../controllers/category.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
async function categoryRoutes(fastify) {
    // Aplicar autenticación a todas las rutas
    fastify.addHook('preHandler', auth_middleware_1.authenticateToken);
    // ============= CATEGORÍAS =============
    // Obtener estadísticas de categorías
    fastify.get('/stats', category_controller_1.getCategoryStats);
    // Obtener todas las categorías
    fastify.get('/', category_controller_1.getAllCategories);
    // Obtener categoría por ID
    fastify.get('/:id', category_controller_1.getCategoryById);
    // Crear nueva categoría
    fastify.post('/', category_controller_1.createCategory);
    // Actualizar categoría
    fastify.put('/:id', category_controller_1.updateCategory);
    // Eliminar categoría
    fastify.delete('/:id', category_controller_1.deleteCategory);
    // ============= SUBCATEGORÍAS =============
    // Obtener todas las subcategorías
    fastify.get('/subcategories', category_controller_1.getAllSubcategories);
    // Obtener subcategoría por ID
    fastify.get('/subcategories/:id', category_controller_1.getSubcategoryById);
    // Crear nueva subcategoría
    fastify.post('/subcategories', category_controller_1.createSubcategory);
    // Actualizar subcategoría
    fastify.put('/subcategories/:id', category_controller_1.updateSubcategory);
    // Eliminar subcategoría
    fastify.delete('/subcategories/:id', category_controller_1.deleteSubcategory);
}
