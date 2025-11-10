"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageUploadController = void 0;
const image_upload_service_1 = require("../services/image-upload.service");
const logger_1 = require("../utils/logger");
class ImageUploadController {
    /**
     * Sube múltiples imágenes para eventos
     */
    async uploadEventImages(request, reply) {
        try {
            const imageUrls = await image_upload_service_1.imageUploadService.uploadMultiple(request, {
                folder: 'events',
                maxFiles: 10,
                maxFileSize: 5 * 1024 * 1024, // 5MB
            });
            return reply.status(201).send({
                message: 'Imágenes subidas exitosamente',
                images: imageUrls,
                count: imageUrls.length,
            });
        }
        catch (error) {
            logger_1.logger.error({ err: error }, 'Error subiendo imágenes de evento:');
            return reply.status(400).send({
                error: error.message || 'Error subiendo imágenes',
            });
        }
    }
    /**
     * Sube múltiples imágenes para venues
     */
    async uploadVenueImages(request, reply) {
        try {
            const imageUrls = await image_upload_service_1.imageUploadService.uploadMultiple(request, {
                folder: 'venues',
                maxFiles: 15,
                maxFileSize: 5 * 1024 * 1024, // 5MB
            });
            return reply.status(201).send({
                message: 'Imágenes subidas exitosamente',
                images: imageUrls,
                count: imageUrls.length,
            });
        }
        catch (error) {
            logger_1.logger.error({ err: error }, 'Error subiendo imágenes de venue:');
            return reply.status(400).send({
                error: error.message || 'Error subiendo imágenes',
            });
        }
    }
    /**
     * Sube imagen para categoría
     */
    async uploadCategoryImage(request, reply) {
        try {
            const imageUrls = await image_upload_service_1.imageUploadService.uploadMultiple(request, {
                folder: 'categories',
                maxFiles: 5,
                maxFileSize: 2 * 1024 * 1024, // 2MB
            });
            return reply.status(201).send({
                message: 'Imágenes subidas exitosamente',
                images: imageUrls,
                count: imageUrls.length,
            });
        }
        catch (error) {
            logger_1.logger.error({ err: error }, 'Error subiendo imágenes de categoría:');
            return reply.status(400).send({
                error: error.message || 'Error subiendo imágenes',
            });
        }
    }
    /**
     * Sube imagen para subcategoría
     */
    async uploadSubcategoryImage(request, reply) {
        try {
            const imageUrls = await image_upload_service_1.imageUploadService.uploadMultiple(request, {
                folder: 'subcategories',
                maxFiles: 5,
                maxFileSize: 2 * 1024 * 1024, // 2MB
            });
            return reply.status(201).send({
                message: 'Imágenes subidas exitosamente',
                images: imageUrls,
                count: imageUrls.length,
            });
        }
        catch (error) {
            logger_1.logger.error({ err: error }, 'Error subiendo imágenes de subcategoría:');
            return reply.status(400).send({
                error: error.message || 'Error subiendo imágenes',
            });
        }
    }
    /**
     * Elimina una imagen
     */
    async deleteImage(request, reply) {
        try {
            const { imageUrl } = request.body;
            if (!imageUrl) {
                return reply.status(400).send({
                    error: 'URL de imagen requerida',
                });
            }
            const deleted = await image_upload_service_1.imageUploadService.deleteImage(imageUrl);
            if (deleted) {
                return reply.send({
                    message: 'Imagen eliminada exitosamente',
                });
            }
            else {
                return reply.status(404).send({
                    error: 'Imagen no encontrada',
                });
            }
        }
        catch (error) {
            logger_1.logger.error({ err: error }, 'Error eliminando imagen:');
            return reply.status(500).send({
                error: 'Error eliminando imagen',
            });
        }
    }
    /**
     * Elimina múltiples imágenes
     */
    async deleteMultipleImages(request, reply) {
        try {
            const { imageUrls } = request.body;
            if (!imageUrls || !Array.isArray(imageUrls)) {
                return reply.status(400).send({
                    error: 'Array de URLs de imágenes requerido',
                });
            }
            await image_upload_service_1.imageUploadService.deleteImages(imageUrls);
            return reply.send({
                message: `${imageUrls.length} imágenes eliminadas exitosamente`,
                count: imageUrls.length,
            });
        }
        catch (error) {
            logger_1.logger.error({ err: error }, 'Error eliminando imágenes:');
            return reply.status(500).send({
                error: 'Error eliminando imágenes',
            });
        }
    }
}
exports.ImageUploadController = ImageUploadController;
