// backend/admin/src/controllers/image-upload.controller.ts
// @ts-nocheck - Legacy file with type issues, to be refactored
import { FastifyRequest, FastifyReply } from 'fastify';
import { imageUploadService } from '../services/image-upload.service';
import { logger } from '../utils/logger';

export class ImageUploadController {
    /**
     * Sube múltiples imágenes para eventos
     */
    async uploadEventImages(request: FastifyRequest, reply: FastifyReply) {
        try {
            const imageUrls = await imageUploadService.uploadMultiple(request, {
                folder: 'events',
                maxFiles: 10,
                maxFileSize: 5 * 1024 * 1024, // 5MB
            });

            return reply.status(201).send({
                message: 'Imágenes subidas exitosamente',
                images: imageUrls,
                count: imageUrls.length,
            });
        } catch (error) {
            logger.error('Error subiendo imágenes de evento:', error);
            return reply.status(400).send({
                error: error.message || 'Error subiendo imágenes',
            });
        }
    }

    /**
     * Sube múltiples imágenes para venues
     */
    async uploadVenueImages(request: FastifyRequest, reply: FastifyReply) {
        try {
            const imageUrls = await imageUploadService.uploadMultiple(request, {
                folder: 'venues',
                maxFiles: 15,
                maxFileSize: 5 * 1024 * 1024, // 5MB
            });

            return reply.status(201).send({
                message: 'Imágenes subidas exitosamente',
                images: imageUrls,
                count: imageUrls.length,
            });
        } catch (error) {
            logger.error('Error subiendo imágenes de venue:', error);
            return reply.status(400).send({
                error: error.message || 'Error subiendo imágenes',
            });
        }
    }

    /**
     * Sube imagen para categoría
     */
    async uploadCategoryImage(request: FastifyRequest, reply: FastifyReply) {
        try {
            const imageUrls = await imageUploadService.uploadMultiple(request, {
                folder: 'categories',
                maxFiles: 5,
                maxFileSize: 2 * 1024 * 1024, // 2MB
            });

            return reply.status(201).send({
                message: 'Imágenes subidas exitosamente',
                images: imageUrls,
                count: imageUrls.length,
            });
        } catch (error) {
            logger.error('Error subiendo imágenes de categoría:', error);
            return reply.status(400).send({
                error: error.message || 'Error subiendo imágenes',
            });
        }
    }

    /**
     * Sube imagen para subcategoría
     */
    async uploadSubcategoryImage(request: FastifyRequest, reply: FastifyReply) {
        try {
            const imageUrls = await imageUploadService.uploadMultiple(request, {
                folder: 'subcategories',
                maxFiles: 5,
                maxFileSize: 2 * 1024 * 1024, // 2MB
            });

            return reply.status(201).send({
                message: 'Imágenes subidas exitosamente',
                images: imageUrls,
                count: imageUrls.length,
            });
        } catch (error) {
            logger.error('Error subiendo imágenes de subcategoría:', error);
            return reply.status(400).send({
                error: error.message || 'Error subiendo imágenes',
            });
        }
    }

    /**
     * Elimina una imagen
     */
    async deleteImage(
        request: FastifyRequest<{ Body: { imageUrl: string } }>,
        reply: FastifyReply
    ) {
        try {
            const { imageUrl } = request.body;

            if (!imageUrl) {
                return reply.status(400).send({
                    error: 'URL de imagen requerida',
                });
            }

            const deleted = await imageUploadService.deleteImage(imageUrl);

            if (deleted) {
                return reply.send({
                    message: 'Imagen eliminada exitosamente',
                });
            } else {
                return reply.status(404).send({
                    error: 'Imagen no encontrada',
                });
            }
        } catch (error) {
            logger.error('Error eliminando imagen:', error);
            return reply.status(500).send({
                error: 'Error eliminando imagen',
            });
        }
    }

    /**
     * Elimina múltiples imágenes
     */
    async deleteMultipleImages(
        request: FastifyRequest<{ Body: { imageUrls: string[] } }>,
        reply: FastifyReply
    ) {
        try {
            const { imageUrls } = request.body;

            if (!imageUrls || !Array.isArray(imageUrls)) {
                return reply.status(400).send({
                    error: 'Array de URLs de imágenes requerido',
                });
            }

            await imageUploadService.deleteImages(imageUrls);

            return reply.send({
                message: `${imageUrls.length} imágenes eliminadas exitosamente`,
                count: imageUrls.length,
            });
        } catch (error) {
            logger.error('Error eliminando imágenes:', error);
            return reply.status(500).send({
                error: 'Error eliminando imágenes',
            });
        }
    }
}
