"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageUploadRoutes = imageUploadRoutes;
const image_upload_controller_1 = require("../controllers/image-upload.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const imageController = new image_upload_controller_1.ImageUploadController();
async function imageUploadRoutes(fastify) {
    // Todas las rutas requieren autenticación
    fastify.addHook('preHandler', auth_middleware_1.authMiddleware);
    // Upload de imágenes de eventos
    fastify.post('/events', imageController.uploadEventImages.bind(imageController));
    // Upload de imágenes de venues
    fastify.post('/venues', imageController.uploadVenueImages.bind(imageController));
    // Upload de imágenes de categorías
    fastify.post('/categories', imageController.uploadCategoryImage.bind(imageController));
    // Upload de imágenes de subcategorías
    fastify.post('/subcategories', imageController.uploadSubcategoryImage.bind(imageController));
    // Eliminar una imagen
    fastify.delete('/', imageController.deleteImage.bind(imageController));
    // Eliminar múltiples imágenes
    fastify.post('/delete-multiple', imageController.deleteMultipleImages.bind(imageController));
}
