"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageUploadService = exports.ImageUploadService = void 0;
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const util_1 = require("util");
const stream_1 = require("stream");
const logger_1 = require("../utils/logger");
const pump = (0, util_1.promisify)(stream_1.pipeline);
class ImageUploadService {
    uploadDir;
    publicUrl;
    constructor() {
        this.uploadDir = process.env.UPLOAD_DIR || './uploads';
        this.publicUrl = process.env.PUBLIC_URL || 'http://localhost:3003';
    }
    async initialize() {
        // Crear directorios si no existen
        const folders = ['events', 'venues', 'categories', 'subcategories'];
        for (const folder of folders) {
            const dir = path_1.default.join(this.uploadDir, folder);
            try {
                await promises_1.default.access(dir);
            }
            catch {
                await promises_1.default.mkdir(dir, { recursive: true });
                logger_1.logger.info(`Directorio creado: ${dir}`);
            }
        }
    }
    /**
     * Sube múltiples archivos desde un request de Fastify
     */
    async uploadMultiple(request, options = {}) {
        const { maxFiles = 10, maxFileSize = 5 * 1024 * 1024, // 5MB por defecto
        allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'], folder = 'general', } = options;
        const uploadedUrls = [];
        try {
            const parts = request.parts();
            let fileCount = 0;
            for await (const part of parts) {
                if (part.type === 'file') {
                    fileCount++;
                    if (fileCount > maxFiles) {
                        throw new Error(`Máximo ${maxFiles} archivos permitidos`);
                    }
                    // Validar tipo MIME
                    if (!allowedMimeTypes.includes(part.mimetype)) {
                        throw new Error(`Tipo de archivo no permitido: ${part.mimetype}. Permitidos: ${allowedMimeTypes.join(', ')}`);
                    }
                    // Generar nombre único
                    const fileExt = path_1.default.extname(part.filename);
                    const fileName = `${(0, uuid_1.v4)()}${fileExt}`;
                    const folderPath = path_1.default.join(this.uploadDir, folder);
                    const filePath = path_1.default.join(folderPath, fileName);
                    // Asegurar que existe el directorio
                    await promises_1.default.mkdir(folderPath, { recursive: true });
                    // Guardar archivo con límite de tamaño
                    let bytesWritten = 0;
                    const writeStream = await promises_1.default.open(filePath, 'w');
                    const fileHandle = writeStream;
                    try {
                        for await (const chunk of part.file) {
                            bytesWritten += chunk.length;
                            if (bytesWritten > maxFileSize) {
                                await promises_1.default.unlink(filePath).catch(() => { });
                                throw new Error(`Archivo excede el tamaño máximo de ${maxFileSize / 1024 / 1024}MB`);
                            }
                            await fileHandle.write(chunk);
                        }
                    }
                    finally {
                        await fileHandle.close();
                    }
                    // Construir URL pública
                    const publicUrl = `${this.publicUrl}/uploads/${folder}/${fileName}`;
                    uploadedUrls.push(publicUrl);
                    logger_1.logger.info(`Archivo subido: ${fileName} (${bytesWritten} bytes)`);
                }
            }
            if (fileCount === 0) {
                throw new Error('No se encontraron archivos en la petición');
            }
            return uploadedUrls;
        }
        catch (error) {
            // Limpiar archivos subidos en caso de error
            for (const url of uploadedUrls) {
                const fileName = path_1.default.basename(url);
                const filePath = path_1.default.join(this.uploadDir, folder, fileName);
                await promises_1.default.unlink(filePath).catch(() => { });
            }
            throw error;
        }
    }
    /**
     * Elimina una imagen del servidor
     */
    async deleteImage(imageUrl) {
        try {
            // Extraer la ruta del archivo desde la URL
            const urlPath = new URL(imageUrl).pathname;
            const filePath = path_1.default.join(this.uploadDir, urlPath.replace('/uploads/', ''));
            await promises_1.default.unlink(filePath);
            logger_1.logger.info(`Imagen eliminada: ${filePath}`);
            return true;
        }
        catch (error) {
            logger_1.logger.error(`Error eliminando imagen: ${error}`);
            return false;
        }
    }
    /**
     * Elimina múltiples imágenes
     */
    async deleteImages(imageUrls) {
        await Promise.all(imageUrls.map(url => this.deleteImage(url)));
    }
    /**
     * Valida que una URL de imagen existe
     */
    async validateImageUrl(imageUrl) {
        try {
            const urlPath = new URL(imageUrl).pathname;
            const filePath = path_1.default.join(this.uploadDir, urlPath.replace('/uploads/', ''));
            await promises_1.default.access(filePath);
            return true;
        }
        catch {
            return false;
        }
    }
}
exports.ImageUploadService = ImageUploadService;
// Instancia singleton
exports.imageUploadService = new ImageUploadService();
