// @ts-nocheck - Legacy file with type issues, to be refactored
import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Schemas con campos de imágenes
const createCategorySchema = z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    icon: z.string().optional(),
    image: z.string().optional(),
    images: z.array(z.string()).optional(),
    description: z.string().optional(),
    slug: z.string().optional(),
});

const updateCategorySchema = createCategorySchema.partial();

const createSubcategorySchema = z.object({
    categoryId: z.number().int().positive('ID de categoría requerido'),
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    icon: z.string().optional(),
    image: z.string().optional(),
    description: z.string().optional(),
    slug: z.string().optional(),
});

const updateSubcategorySchema = createSubcategorySchema.partial();

// ============= CATEGORÍAS =============

export const getAllCategories = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
        const categories = await prisma.eventCategory.findMany({
            include: {
                subcategories: {
                    orderBy: { name: 'asc' },
                },
                _count: {
                    select: {
                        events: true,
                        subcategories: true,
                    },
                },
            },
            orderBy: { name: 'asc' },
        });

        reply.send({
            success: true,
            data: categories,
            pagination: {
                page: 1,
                limit: 50,
                total: categories.length,
                totalPages: 1,
                hasNext: false,
                hasPrev: false,
            },
        });
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        reply.code(500).send({
            success: false,
            error: 'Error interno del servidor',
        });
    }
};

export const getCategoryById = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
        const { id } = req.params as { id: string };
        const categoryId = parseInt(id, 10);

        if (isNaN(categoryId)) {
            return reply.code(400).send({
                success: false,
                error: 'ID de categoría inválido',
            });
        }

        const category = await prisma.eventCategory.findUnique({
            where: { id: categoryId },
            include: {
                subcategories: {
                    orderBy: { name: 'asc' },
                },
                _count: {
                    select: {
                        events: true,
                        subcategories: true,
                    },
                },
            },
        });

        if (!category) {
            return reply.code(404).send({
                success: false,
                error: 'Categoría no encontrada',
            });
        }

        reply.send({
            success: true,
            data: category,
        });
    } catch (error) {
        console.error('Error al obtener categoría:', error);
        reply.code(500).send({
            success: false,
            error: 'Error interno del servidor',
        });
    }
};

export const createCategory = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
        const data = createCategorySchema.parse(req.body);

        // Verificar si ya existe una categoría con el mismo nombre
        const existingCategory = await prisma.eventCategory.findUnique({
            where: { name: data.name },
        });

        if (existingCategory) {
            return reply.code(400).send({
                success: false,
                error: 'Ya existe una categoría con ese nombre',
            });
        }

        const category = await prisma.eventCategory.create({
            data,
            include: {
                _count: {
                    select: {
                        events: true,
                        subcategories: true,
                    },
                },
            },
        });

        console.log(`Categoría creada: ${category.name}`);

        reply.code(201).send({
            success: true,
            data: category,
            message: 'Categoría creada exitosamente',
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return reply.code(400).send({
                success: false,
                error: 'Datos de entrada inválidos',
                details: error.errors,
            });
        }

        console.error('Error al crear categoría:', error);
        reply.code(500).send({
            success: false,
            error: 'Error interno del servidor',
        });
    }
};

export const updateCategory = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
        const { id } = req.params as { id: string };
        const categoryId = parseInt(id, 10);

        if (isNaN(categoryId)) {
            return reply.code(400).send({
                success: false,
                error: 'ID de categoría inválido',
            });
        }

        const data = updateCategorySchema.parse(req.body);

        const updatedCategory = await prisma.eventCategory.update({
            where: { id: categoryId },
            data,
            include: {
                subcategories: {
                    orderBy: { name: 'asc' },
                },
                _count: {
                    select: {
                        events: true,
                        subcategories: true,
                    },
                },
            },
        });

        reply.send({
            success: true,
            data: updatedCategory,
            message: 'Categoría actualizada exitosamente',
        });
    } catch (error) {
        console.error('Error al actualizar categoría:', error);
        reply.code(500).send({
            success: false,
            error: 'Error interno del servidor',
        });
    }
};

export const deleteCategory = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
        const { id } = req.params as { id: string };
        const categoryId = parseInt(id, 10);

        if (isNaN(categoryId)) {
            return reply.code(400).send({
                success: false,
                error: 'ID de categoría inválido',
            });
        }

        await prisma.eventCategory.delete({
            where: { id: categoryId },
        });

        reply.send({
            success: true,
            message: 'Categoría eliminada exitosamente',
        });
    } catch (error) {
        console.error('Error al eliminar categoría:', error);
        reply.code(500).send({
            success: false,
            error: 'Error interno del servidor',
        });
    }
};

// ============= SUBCATEGORÍAS =============

export const getAllSubcategories = async (
    req: FastifyRequest,
    reply: FastifyReply
): Promise<void> => {
    try {
        const subcategories = await prisma.eventSubcategory.findMany({
            include: {
                category: true,
                _count: {
                    select: {
                        events: true,
                    },
                },
            },
            orderBy: [{ category: { name: 'asc' } }, { name: 'asc' }],
        });

        reply.send({
            success: true,
            data: subcategories,
            pagination: {
                page: 1,
                limit: 50,
                total: subcategories.length,
                totalPages: 1,
                hasNext: false,
                hasPrev: false,
            },
        });
    } catch (error) {
        console.error('Error al obtener subcategorías:', error);
        reply.code(500).send({
            success: false,
            error: 'Error interno del servidor',
        });
    }
};

export const createSubcategory = async (
    req: FastifyRequest,
    reply: FastifyReply
): Promise<void> => {
    try {
        console.log('Datos recibidos para crear subcategoría:', req.body);
        const data = createSubcategorySchema.parse(req.body);
        console.log('Datos validados:', data);

        const subcategoryData = {
            categoryId: Number(data.categoryId),
            name: data.name,
            icon: data.icon,
            image: data.image,
            description: data.description,
            slug: data.slug,
        };

        console.log('Datos para Prisma:', subcategoryData);

        const subcategory = await prisma.eventSubcategory.create({
            data: subcategoryData,
            include: {
                category: true,
                _count: {
                    select: {
                        events: true,
                    },
                },
            },
        });

        console.log('Subcategoría creada:', subcategory);

        reply.code(201).send({
            success: true,
            data: subcategory,
            message: 'Subcategoría creada exitosamente',
        });
    } catch (error) {
        console.error('Error al crear subcategoría:', error);
        console.error('Stack trace:', error.stack);
        reply.code(500).send({
            success: false,
            error: 'Error interno del servidor',
            details: error.message,
        });
    }
};

export const updateSubcategory = async (
    req: FastifyRequest,
    reply: FastifyReply
): Promise<void> => {
    try {
        const { id } = req.params as { id: string };
        const subcategoryId = parseInt(id, 10);

        if (isNaN(subcategoryId)) {
            return reply.code(400).send({
                success: false,
                error: 'ID de subcategoría inválido',
            });
        }

        const data = updateSubcategorySchema.parse(req.body);

        const updatedSubcategory = await prisma.eventSubcategory.update({
            where: { id: subcategoryId },
            data,
            include: {
                category: true,
                _count: {
                    select: {
                        events: true,
                    },
                },
            },
        });

        reply.send({
            success: true,
            data: updatedSubcategory,
            message: 'Subcategoría actualizada exitosamente',
        });
    } catch (error) {
        console.error('Error al actualizar subcategoría:', error);
        reply.code(500).send({
            success: false,
            error: 'Error interno del servidor',
        });
    }
};

export const deleteSubcategory = async (
    req: FastifyRequest,
    reply: FastifyReply
): Promise<void> => {
    try {
        const { id } = req.params as { id: string };
        const subcategoryId = parseInt(id, 10);

        if (isNaN(subcategoryId)) {
            return reply.code(400).send({
                success: false,
                error: 'ID de subcategoría inválido',
            });
        }

        await prisma.eventSubcategory.delete({
            where: { id: subcategoryId },
        });

        reply.send({
            success: true,
            message: 'Subcategoría eliminada exitosamente',
        });
    } catch (error) {
        console.error('Error al eliminar subcategoría:', error);
        reply.code(500).send({
            success: false,
            error: 'Error interno del servidor',
        });
    }
};

export const getCategoryStats = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
        const [totalCategories, totalSubcategories, categoriesWithEvents] = await Promise.all([
            prisma.eventCategory.count(),
            prisma.eventSubcategory.count(),
            prisma.eventCategory.count({
                where: {
                    events: {
                        some: {},
                    },
                },
            }),
        ]);

        const categoryStats = await prisma.eventCategory.findMany({
            select: {
                id: true,
                name: true,
                _count: {
                    select: {
                        events: true,
                        subcategories: true,
                    },
                },
            },
            orderBy: {
                events: {
                    _count: 'desc',
                },
            },
            take: 5,
        });

        reply.send({
            success: true,
            data: {
                totalCategories,
                totalSubcategories,
                categoriesWithEvents,
                topCategories: categoryStats,
            },
        });
    } catch (error) {
        console.error('Error al obtener estadísticas de categorías:', error);
        reply.code(500).send({
            success: false,
            error: 'Error interno del servidor',
        });
    }
};