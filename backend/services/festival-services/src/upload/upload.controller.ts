import {
  Controller,
  Post,
  Delete,
  UseInterceptors,
  UploadedFiles,
  Body,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/upload')
export class UploadController {
  private readonly uploadPath = join(process.cwd(), 'uploads');

  constructor() {
    // Crear directorios si no existen
    this.ensureUploadDirectories();
  }

  private ensureUploadDirectories() {
    const directories = [
      this.uploadPath,
      join(this.uploadPath, 'events'),
      join(this.uploadPath, 'venues'),
      join(this.uploadPath, 'categories'),
      join(this.uploadPath, 'subcategories'),
    ];

    directories.forEach((dir) => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    });
  }

  @Post('events')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads', 'events'),
        filename: (req, file, cb) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Tipo de archivo no permitido'), false);
        }
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadEventImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No se han proporcionado archivos');
    }

    const baseUrl = process.env.API_URL || 'http://localhost:3004';
    const imageUrls = files.map((file) => `${baseUrl}/uploads/events/${file.filename}`);

    return {
      message: 'Imágenes subidas exitosamente',
      images: imageUrls,
      count: imageUrls.length,
    };
  }

  @Post('venues')
  @UseInterceptors(
    FilesInterceptor('files', 15, {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads', 'venues'),
        filename: (req, file, cb) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Tipo de archivo no permitido'), false);
        }
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadVenueImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No se han proporcionado archivos');
    }

    const baseUrl = process.env.API_URL || 'http://localhost:3004';
    const imageUrls = files.map((file) => `${baseUrl}/uploads/venues/${file.filename}`);

    return {
      message: 'Imágenes subidas exitosamente',
      images: imageUrls,
      count: imageUrls.length,
    };
  }

  @Post('categories')
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads', 'categories'),
        filename: (req, file, cb) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Tipo de archivo no permitido'), false);
        }
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadCategoryImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No se han proporcionado archivos');
    }

    const baseUrl = process.env.API_URL || 'http://localhost:3004';
    const imageUrls = files.map((file) => `${baseUrl}/uploads/categories/${file.filename}`);

    return {
      message: 'Imágenes subidas exitosamente',
      images: imageUrls,
      count: imageUrls.length,
    };
  }

  @Post('subcategories')
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads', 'subcategories'),
        filename: (req, file, cb) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Tipo de archivo no permitido'), false);
        }
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadSubcategoryImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No se han proporcionado archivos');
    }

    const baseUrl = process.env.API_URL || 'http://localhost:3004';
    const imageUrls = files.map((file) => `${baseUrl}/uploads/subcategories/${file.filename}`);

    return {
      message: 'Imágenes subidas exitosamente',
      images: imageUrls,
      count: imageUrls.length,
    };
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  async deleteImage(@Body('imageUrl') imageUrl: string) {
    if (!imageUrl) {
      throw new BadRequestException('URL de imagen no proporcionada');
    }

    try {
      // Extraer el path relativo de la URL
      const urlParts = imageUrl.split('/uploads/');
      if (urlParts.length < 2) {
        throw new BadRequestException('URL de imagen inválida');
      }

      const relativePath = urlParts[1];
      const filePath = join(this.uploadPath, relativePath);

      if (existsSync(filePath)) {
        unlinkSync(filePath);
        return { message: 'Imagen eliminada exitosamente' };
      } else {
        throw new BadRequestException('Imagen no encontrada');
      }
    } catch (error) {
      throw new BadRequestException('Error al eliminar la imagen');
    }
  }

  @Post('delete-multiple')
  @UseGuards(JwtAuthGuard)
  async deleteMultipleImages(@Body('imageUrls') imageUrls: string[]) {
    if (!imageUrls || imageUrls.length === 0) {
      throw new BadRequestException('URLs de imágenes no proporcionadas');
    }

    let deletedCount = 0;

    for (const imageUrl of imageUrls) {
      try {
        const urlParts = imageUrl.split('/uploads/');
        if (urlParts.length >= 2) {
          const relativePath = urlParts[1];
          const filePath = join(this.uploadPath, relativePath);

          if (existsSync(filePath)) {
            unlinkSync(filePath);
            deletedCount++;
          }
        }
      } catch (error) {
        console.error('Error eliminando imagen:', error);
      }
    }

    return {
      message: `${deletedCount} imagen(es) eliminada(s) exitosamente`,
      count: deletedCount,
    };
  }
}
