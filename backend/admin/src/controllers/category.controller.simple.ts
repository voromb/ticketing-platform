import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Schemas básicos
const createCategorySchema = z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
});

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
