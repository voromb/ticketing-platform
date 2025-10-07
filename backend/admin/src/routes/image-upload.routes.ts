// backend/admin/src/routes/image-upload.routes.ts
import { FastifyInstance } from 'fastify';
import { ImageUploadController } from '../controllers/image-upload.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const imageController = new ImageUploadController();

export async function imageUploadRoutes(fastify: FastifyInstance) {
    // Todas las rutas requieren autenticación
    fastify.addHook('preHandler', authMiddleware);

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
