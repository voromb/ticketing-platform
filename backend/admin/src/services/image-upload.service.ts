// backend/admin/src/services/image-upload.service.ts
import { FastifyRequest } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { logger } from '../utils/logger';

const pump = promisify(pipeline);

interface UploadOptions {
    maxFiles?: number;
    maxFileSize?: number; // en bytes
    allowedMimeTypes?: string[];
    folder?: string;
}

export class ImageUploadService {
    private uploadDir: string;
    private publicUrl: string;

    constructor() {
        this.uploadDir = process.env.UPLOAD_DIR || './uploads';
        this.publicUrl = process.env.PUBLIC_URL || 'http://localhost:3003';
    }

    async initialize() {
        // Crear directorios si no existen
        const folders = ['events', 'venues', 'categories', 'subcategories'];

        for (const folder of folders) {
            const dir = path.join(this.uploadDir, folder);
            try {
                await fs.access(dir);
            } catch {
                await fs.mkdir(dir, { recursive: true });
                logger.info(`Directorio creado: ${dir}`);
            }
        }
    }

    /**
     * Sube múltiples archivos desde un request de Fastify
     */
    async uploadMultiple(request: FastifyRequest, options: UploadOptions = {}): Promise<string[]> {
        const {
            maxFiles = 10,
            maxFileSize = 5 * 1024 * 1024, // 5MB por defecto
            allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
            folder = 'general',
        } = options;

        const uploadedUrls: string[] = [];

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
                        throw new Error(
                            `Tipo de archivo no permitido: ${
                                part.mimetype
                            }. Permitidos: ${allowedMimeTypes.join(', ')}`
                        );
                    }

                    // Generar nombre único
                    const fileExt = path.extname(part.filename);
                    const fileName = `${uuidv4()}${fileExt}`;
                    const folderPath = path.join(this.uploadDir, folder);
                    const filePath = path.join(folderPath, fileName);

                    // Asegurar que existe el directorio
                    await fs.mkdir(folderPath, { recursive: true });

                    // Guardar archivo con límite de tamaño
                    let bytesWritten = 0;
                    const writeStream = await fs.open(filePath, 'w');
                    const fileHandle = writeStream;

                    try {
                        for await (const chunk of part.file) {
                            bytesWritten += chunk.length;
                            if (bytesWritten > maxFileSize) {
                                await fs.unlink(filePath).catch(() => {});
                                throw new Error(
                                    `Archivo excede el tamaño máximo de ${
                                        maxFileSize / 1024 / 1024
                                    }MB`
                                );
                            }
                            await fileHandle.write(chunk);
                        }
                    } finally {
                        await fileHandle.close();
                    }

                    // Construir URL pública
                    const publicUrl = `${this.publicUrl}/uploads/${folder}/${fileName}`;
                    uploadedUrls.push(publicUrl);

                    logger.info(`Archivo subido: ${fileName} (${bytesWritten} bytes)`);
                }
            }

            if (fileCount === 0) {
                throw new Error('No se encontraron archivos en la petición');
            }

            return uploadedUrls;
        } catch (error) {
            // Limpiar archivos subidos en caso de error
            for (const url of uploadedUrls) {
                const fileName = path.basename(url);
                const filePath = path.join(this.uploadDir, folder, fileName);
                await fs.unlink(filePath).catch(() => {});
            }
            throw error;
        }
    }

    /**
     * Elimina una imagen del servidor
     */
    async deleteImage(imageUrl: string): Promise<boolean> {
        try {
            // Extraer la ruta del archivo desde la URL
            const urlPath = new URL(imageUrl).pathname;
            const filePath = path.join(this.uploadDir, urlPath.replace('/uploads/', ''));

            await fs.unlink(filePath);
            logger.info(`Imagen eliminada: ${filePath}`);
            return true;
        } catch (error: any) {
            logger.error({ err: error }, 'Error eliminando imagen');
            return false;
        }
    }

    /**
     * Elimina múltiples imágenes
     */
    async deleteImages(imageUrls: string[]): Promise<void> {
        await Promise.all(imageUrls.map(url => this.deleteImage(url)));
    }

    /**
     * Valida que una URL de imagen existe
     */
    async validateImageUrl(imageUrl: string): Promise<boolean> {
        try {
            const urlPath = new URL(imageUrl).pathname;
            const filePath = path.join(this.uploadDir, urlPath.replace('/uploads/', ''));
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }
}

// Instancia singleton
export const imageUploadService = new ImageUploadService();
