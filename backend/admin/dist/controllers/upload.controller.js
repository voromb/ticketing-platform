"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const util_1 = require("util");
const stream_1 = require("stream");
const logger_1 = __importDefault(require("../utils/logger"));
const pump = (0, util_1.promisify)(stream_1.pipeline);
const prisma = new client_1.PrismaClient();
// Configuración de upload
const UPLOAD_DIR = path_1.default.join(process.cwd(), 'uploads', 'events');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
class UploadController {
    constructor() {
        // Crear directorio de uploads si no existe
        this.ensureUploadDir();
    }
    ensureUploadDir() {
        if (!fs_1.default.existsSync(UPLOAD_DIR)) {
            fs_1.default.mkdirSync(UPLOAD_DIR, { recursive: true });
            logger_1.default.info(`📁 Directorio de uploads creado: ${UPLOAD_DIR}`);
        }
    }
    /**
     * Subir imagen para evento
     */
    async uploadEventImage(request, reply) {
        try {
            const { user } = request;
            if (!user || !user.id) {
                return reply.code(403).send({
                    success: false,
                    error: 'Usuario no autenticado'
                });
            }
            // Obtener el archivo del multipart
            const data = await request.file();
            if (!data) {
                return reply.code(400).send({
                    success: false,
                    error: 'No se proporcionó ningún archivo'
                });
            }
            // Validar tipo de archivo
            if (!ALLOWED_TYPES.includes(data.mimetype)) {
                return reply.code(400).send({
                    success: false,
                    error: `Tipo de archivo no permitido. Tipos válidos: ${ALLOWED_TYPES.join(', ')}`
                });
            }
            // Validar tamaño (aproximado)
            const fileBuffer = await data.toBuffer();
            if (fileBuffer.length > MAX_FILE_SIZE) {
                return reply.code(400).send({
                    success: false,
                    error: `Archivo demasiado grande. Máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB`
                });
            }
            // Generar nombre único para el archivo
            const fileExtension = path_1.default.extname(data.filename);
            const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}${fileExtension}`;
            const filePath = path_1.default.join(UPLOAD_DIR, uniqueFileName);
            // Guardar archivo
            fs_1.default.writeFileSync(filePath, fileBuffer);
            // URL relativa para servir la imagen
            const imageUrl = `/uploads/events/${uniqueFileName}`;
            logger_1.default.info(`📸 Imagen subida exitosamente: ${uniqueFileName} por usuario ${user.id}`);
            return reply.send({
                success: true,
                data: {
                    filename: uniqueFileName,
                    originalName: data.filename,
                    url: imageUrl,
                    size: fileBuffer.length,
                    mimetype: data.mimetype
                },
                message: 'Imagen subida exitosamente'
            });
        }
        catch (error) {
            logger_1.default.error('Error subiendo imagen:', error);
            return reply.status(500).send({
                success: false,
                error: 'Error interno del servidor al subir imagen'
            });
        }
    }
    /**
     * Actualizar imagen de evento específico
     */
    async updateEventImage(request, reply) {
        try {
            const { user } = request;
            const { eventId } = request.params;
            const { imageUrl, imageType } = request.body;
            if (!user || !user.id) {
                return reply.code(403).send({
                    success: false,
                    error: 'Usuario no autenticado'
                });
            }
            // Verificar que el evento existe
            const event = await prisma.event.findUnique({
                where: { id: eventId }
            });
            if (!event) {
                return reply.code(404).send({
                    success: false,
                    error: 'Evento no encontrado'
                });
            }
            // Actualizar según el tipo de imagen
            const updateData = {};
            if (imageType === 'banner') {
                updateData.bannerImage = imageUrl;
            }
            else if (imageType === 'thumbnail') {
                updateData.thumbnailImage = imageUrl;
            }
            const updatedEvent = await prisma.event.update({
                where: { id: eventId },
                data: updateData,
                include: {
                    venue: {
                        select: {
                            id: true,
                            name: true,
                            city: true
                        }
                    }
                }
            });
            logger_1.default.info(`🖼️ Imagen ${imageType} actualizada para evento ${eventId}`);
            return reply.send({
                success: true,
                data: updatedEvent,
                message: `Imagen ${imageType} actualizada exitosamente`
            });
        }
        catch (error) {
            logger_1.default.error('Error actualizando imagen del evento:', error);
            return reply.status(500).send({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }
    /**
     * Eliminar imagen
     */
    async deleteImage(request, reply) {
        try {
            const { user } = request;
            const { filename } = request.params;
            if (!user || !user.id) {
                return reply.code(403).send({
                    success: false,
                    error: 'Usuario no autenticado'
                });
            }
            const filePath = path_1.default.join(UPLOAD_DIR, filename);
            // Verificar que el archivo existe
            if (!fs_1.default.existsSync(filePath)) {
                return reply.code(404).send({
                    success: false,
                    error: 'Archivo no encontrado'
                });
            }
            // Eliminar archivo
            fs_1.default.unlinkSync(filePath);
            logger_1.default.info(`🗑️ Imagen eliminada: ${filename} por usuario ${user.id}`);
            return reply.send({
                success: true,
                message: 'Imagen eliminada exitosamente'
            });
        }
        catch (error) {
            logger_1.default.error('Error eliminando imagen:', error);
            return reply.status(500).send({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }
    /**
     * Listar imágenes subidas
     */
    async listImages(request, reply) {
        try {
            const { user } = request;
            if (!user || !user.id) {
                return reply.code(403).send({
                    success: false,
                    error: 'Usuario no autenticado'
                });
            }
            // Leer directorio de uploads
            const files = fs_1.default.readdirSync(UPLOAD_DIR);
            const images = files
                .filter(file => {
                const ext = path_1.default.extname(file).toLowerCase();
                return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
            })
                .map(file => {
                const filePath = path_1.default.join(UPLOAD_DIR, file);
                const stats = fs_1.default.statSync(filePath);
                return {
                    filename: file,
                    url: `/uploads/events/${file}`,
                    size: stats.size,
                    uploadedAt: stats.birthtime
                };
            })
                .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
            return reply.send({
                success: true,
                data: images,
                total: images.length
            });
        }
        catch (error) {
            logger_1.default.error('Error listando imágenes:', error);
            return reply.status(500).send({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }
}
exports.default = new UploadController();
