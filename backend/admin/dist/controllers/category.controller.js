"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategoryStats = exports.deleteSubcategory = exports.updateSubcategory = exports.createSubcategory = exports.getSubcategoryById = exports.getAllSubcategories = exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategoryById = exports.getAllCategories = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const logger_1 = require("../utils/logger");
const prisma = new client_1.PrismaClient();
// Schemas de validación
const createCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
});
const updateCategorySchema = createCategorySchema.partial();
const createSubcategorySchema = zod_1.z.object({
    categoryId: zod_1.z.number().int().positive('ID de categoría requerido'),
    name: zod_1.z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
});
const updateSubcategorySchema = createSubcategorySchema.partial();
const categoryQuerySchema = zod_1.z.object({
    page: zod_1.z.string().optional().default('1').transform(Number),
    limit: zod_1.z.string().optional().default('50').transform(Number),
    search: zod_1.z.string().optional(),
    includeSubcategories: zod_1.z
        .string()
        .optional()
        .transform(val => val === 'true'),
});
// ============= CATEGORÍAS =============
const getAllCategories = async (req, reply) => {
    try {
        const query = categoryQuerySchema.parse(req.query);
        const { page, limit, search, includeSubcategories } = query;
        const skip = (page - 1) * limit;
        const where = search
            ? {
                name: {
                    contains: search,
                    mode: 'insensitive',
                },
            }
            : {};
        const include = includeSubcategories
            ? {
                subcategories: {
                    orderBy: { name: 'asc' },
                },
                _count: {
                    select: {
                        events: true,
                        subcategories: true,
                    },
                },
            }
            : {
                _count: {
                    select: {
                        events: true,
                        subcategories: true,
                    },
                },
            };
        const [categories, total] = await Promise.all([
            prisma.eventCategory.findMany({
                where,
                include,
                orderBy: { name: 'asc' },
                skip,
                take: limit,
            }),
            prisma.eventCategory.count({ where }),
        ]);
        const totalPages = Math.ceil(total / limit);
        reply.send({
            success: true,
            data: categories,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        });
    }
    catch (error) {
        logger_1.logger.error('Error al obtener categorías:', error);
        reply.code(500).send({
            success: false,
            error: 'Error interno del servidor',
        });
    }
};
exports.getAllCategories = getAllCategories;
const getCategoryById = async (req, reply) => {
    try {
        const { id } = req.params;
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
    }
    catch (error) {
        logger_1.logger.error('Error al obtener categoría:', error);
        reply.code(500).send({
            success: false,
            error: 'Error interno del servidor',
        });
    }
};
exports.getCategoryById = getCategoryById;
const createCategory = async (req, reply) => {
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
        logger_1.logger.info(`Categoría creada: ${category.name}`);
        reply.code(201).send({
            success: true,
            data: category,
            message: 'Categoría creada exitosamente',
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return reply.code(400).send({
                success: false,
                error: 'Datos de entrada inválidos',
                details: error.errors,
            });
        }
        logger_1.logger.error('Error al crear categoría:', error);
        reply.code(500).send({
            success: false,
            error: 'Error interno del servidor',
        });
    }
};
exports.createCategory = createCategory;
const updateCategory = async (req, reply) => {
    try {
        const { id } = req.params;
        const categoryId = parseInt(id, 10);
        if (isNaN(categoryId)) {
            return reply.code(400).send({
                success: false,
                error: 'ID de categoría inválido',
            });
        }
        const data = updateCategorySchema.parse(req.body);
        // Verificar si la categoría existe
        const existingCategory = await prisma.eventCategory.findUnique({
            where: { id: categoryId },
        });
        if (!existingCategory) {
            return reply.code(404).send({
                success: false,
                error: 'Categoría no encontrada',
            });
        }
        // Si se está actualizando el nombre, verificar que no exista otra categoría con el mismo nombre
        if (data.name && data.name !== existingCategory.name) {
            const duplicateCategory = await prisma.eventCategory.findUnique({
                where: { name: data.name },
            });
            if (duplicateCategory) {
                return reply.code(400).send({
                    success: false,
                    error: 'Ya existe una categoría con ese nombre',
                });
            }
        }
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
        logger_1.logger.info(`Categoría actualizada: ${updatedCategory.name}`);
        reply.send({
            success: true,
            data: updatedCategory,
            message: 'Categoría actualizada exitosamente',
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return reply.code(400).send({
                success: false,
                error: 'Datos de entrada inválidos',
                details: error.errors,
            });
        }
        logger_1.logger.error('Error al actualizar categoría:', error);
        reply.code(500).send({
            success: false,
            error: 'Error interno del servidor',
        });
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, reply) => {
    try {
        const { id } = req.params;
        const categoryId = parseInt(id, 10);
        if (isNaN(categoryId)) {
            return reply.code(400).send({
                success: false,
                error: 'ID de categoría inválido',
            });
        }
        // Verificar si la categoría existe
        const existingCategory = await prisma.eventCategory.findUnique({
            where: { id: categoryId },
            include: {
                _count: {
                    select: {
                        events: true,
                        subcategories: true,
                    },
                },
            },
        });
        if (!existingCategory) {
            return reply.code(404).send({
                success: false,
                error: 'Categoría no encontrada',
            });
        }
        // Verificar si hay eventos asociados
        if (existingCategory._count.events > 0) {
            return reply.code(400).send({
                success: false,
                error: `No se puede eliminar la categoría porque tiene ${existingCategory._count.events} evento(s) asociado(s)`,
            });
        }
        // Eliminar la categoría (las subcategorías se eliminan automáticamente por CASCADE)
        await prisma.eventCategory.delete({
            where: { id: categoryId },
        });
        logger_1.logger.info(`Categoría eliminada: ${existingCategory.name}`);
        reply.send({
            success: true,
            message: 'Categoría eliminada exitosamente',
        });
    }
    catch (error) {
        logger_1.logger.error('Error al eliminar categoría:', error);
        reply.code(500).send({
            success: false,
            error: 'Error interno del servidor',
        });
    }
};
exports.deleteCategory = deleteCategory;
// ============= SUBCATEGORÍAS =============
const getAllSubcategories = async (req, reply) => {
    try {
        const query = categoryQuerySchema.parse(req.query);
        const { page, limit, search } = query;
        const skip = (page - 1) * limit;
        const where = search
            ? {
                OR: [
                    {
                        name: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                    {
                        category: {
                            name: {
                                contains: search,
                                mode: 'insensitive',
                            },
                        },
                    },
                ],
            }
            : {};
        const [subcategories, total] = await Promise.all([
            prisma.eventSubcategory.findMany({
                where,
                include: {
                    category: true,
                    _count: {
                        select: {
                            events: true,
                        },
                    },
                },
                orderBy: [{ category: { name: 'asc' } }, { name: 'asc' }],
                skip,
                take: limit,
            }),
            prisma.eventSubcategory.count({ where }),
        ]);
        const totalPages = Math.ceil(total / limit);
        reply.send({
            success: true,
            data: subcategories,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        });
    }
    catch (error) {
        logger_1.logger.error('Error al obtener subcategorías:', error);
        reply.code(500).send({
            success: false,
            error: 'Error interno del servidor',
        });
    }
};
exports.getAllSubcategories = getAllSubcategories;
const getSubcategoryById = async (req, reply) => {
    try {
        const { id } = req.params;
        const subcategoryId = parseInt(id, 10);
        if (isNaN(subcategoryId)) {
            return reply.code(400).send({
                success: false,
                error: 'ID de subcategoría inválido',
            });
        }
        const subcategory = await prisma.eventSubcategory.findUnique({
            where: { id: subcategoryId },
            include: {
                category: true,
                _count: {
                    select: {
                        events: true,
                    },
                },
            },
        });
        if (!subcategory) {
            return reply.code(404).send({
                success: false,
                error: 'Subcategoría no encontrada',
            });
        }
        reply.send({
            success: true,
            data: subcategory,
        });
    }
    catch (error) {
        logger_1.logger.error('Error al obtener subcategoría:', error);
        reply.code(500).send({
            success: false,
            error: 'Error interno del servidor',
        });
    }
};
exports.getSubcategoryById = getSubcategoryById;
const createSubcategory = async (req, reply) => {
    try {
        const data = createSubcategorySchema.parse(req.body);
        // Verificar si la categoría padre existe
        const parentCategory = await prisma.eventCategory.findUnique({
            where: { id: data.categoryId },
        });
        if (!parentCategory) {
            return reply.code(400).send({
                success: false,
                error: 'La categoría padre no existe',
            });
        }
        // Verificar si ya existe una subcategoría con el mismo nombre en la misma categoría
        const existingSubcategory = await prisma.eventSubcategory.findUnique({
            where: {
                categoryId_name: {
                    categoryId: data.categoryId,
                    name: data.name,
                },
            },
        });
        if (existingSubcategory) {
            return reply.code(400).send({
                success: false,
                error: 'Ya existe una subcategoría con ese nombre en esta categoría',
            });
        }
        const subcategory = await prisma.eventSubcategory.create({
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
        logger_1.logger.info(`Subcategoría creada: ${subcategory.name} en ${parentCategory.name}`);
        reply.code(201).send({
            success: true,
            data: subcategory,
            message: 'Subcategoría creada exitosamente',
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return reply.code(400).send({
                success: false,
                error: 'Datos de entrada inválidos',
                details: error.errors,
            });
        }
        logger_1.logger.error('Error al crear subcategoría:', error);
        reply.code(500).send({
            success: false,
            error: 'Error interno del servidor',
        });
    }
};
exports.createSubcategory = createSubcategory;
const updateSubcategory = async (req, reply) => {
    try {
        const { id } = req.params;
        const subcategoryId = parseInt(id, 10);
        if (isNaN(subcategoryId)) {
            return reply.code(400).send({
                success: false,
                error: 'ID de subcategoría inválido',
            });
        }
        const data = updateSubcategorySchema.parse(req.body);
        // Verificar si la subcategoría existe
        const existingSubcategory = await prisma.eventSubcategory.findUnique({
            where: { id: subcategoryId },
            include: { category: true },
        });
        if (!existingSubcategory) {
            return reply.code(404).send({
                success: false,
                error: 'Subcategoría no encontrada',
            });
        }
        // Si se está actualizando la categoría padre, verificar que existe
        if (data.categoryId && data.categoryId !== existingSubcategory.categoryId) {
            const newParentCategory = await prisma.eventCategory.findUnique({
                where: { id: data.categoryId },
            });
            if (!newParentCategory) {
                return reply.code(400).send({
                    success: false,
                    error: 'La nueva categoría padre no existe',
                });
            }
        }
        // Verificar duplicados si se está actualizando el nombre o la categoría
        if (data.name || data.categoryId) {
            const newName = data.name || existingSubcategory.name;
            const newCategoryId = data.categoryId || existingSubcategory.categoryId;
            if (newName !== existingSubcategory.name || newCategoryId !== existingSubcategory.categoryId) {
                const duplicateSubcategory = await prisma.eventSubcategory.findUnique({
                    where: {
                        categoryId_name: {
                            categoryId: newCategoryId,
                            name: newName,
                        },
                    },
                });
                if (duplicateSubcategory && duplicateSubcategory.id !== subcategoryId) {
                    return reply.code(400).send({
                        success: false,
                        error: 'Ya existe una subcategoría con ese nombre en esta categoría',
                    });
                }
            }
        }
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
        logger_1.logger.info(`Subcategoría actualizada: ${updatedSubcategory.name}`);
        reply.send({
            success: true,
            data: updatedSubcategory,
            message: 'Subcategoría actualizada exitosamente',
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return reply.code(400).send({
                success: false,
                error: 'Datos de entrada inválidos',
                details: error.errors,
            });
        }
        logger_1.logger.error('Error al actualizar subcategoría:', error);
        reply.code(500).send({
            success: false,
            error: 'Error interno del servidor',
        });
    }
};
exports.updateSubcategory = updateSubcategory;
const deleteSubcategory = async (req, reply) => {
    try {
        const { id } = req.params;
        const subcategoryId = parseInt(id, 10);
        if (isNaN(subcategoryId)) {
            return reply.code(400).send({
                success: false,
                error: 'ID de subcategoría inválido',
            });
        }
        // Verificar si la subcategoría existe
        const existingSubcategory = await prisma.eventSubcategory.findUnique({
            where: { id: subcategoryId },
            include: {
                category: true,
                _count: {
                    select: {
                        events: true,
                    },
                },
            },
        });
        if (!existingSubcategory) {
            return reply.code(404).send({
                success: false,
                error: 'Subcategoría no encontrada',
            });
        }
        // Verificar si hay eventos asociados
        if (existingSubcategory._count.events > 0) {
            return reply.code(400).send({
                success: false,
                error: `No se puede eliminar la subcategoría porque tiene ${existingSubcategory._count.events} evento(s) asociado(s)`,
            });
        }
        // Eliminar la subcategoría
        await prisma.eventSubcategory.delete({
            where: { id: subcategoryId },
        });
        logger_1.logger.info(`Subcategoría eliminada: ${existingSubcategory.name}`);
        reply.send({
            success: true,
            message: 'Subcategoría eliminada exitosamente',
        });
    }
    catch (error) {
        logger_1.logger.error('Error al eliminar subcategoría:', error);
        reply.code(500).send({
            success: false,
            error: 'Error interno del servidor',
        });
    }
};
exports.deleteSubcategory = deleteSubcategory;
// ============= ESTADÍSTICAS =============
const getCategoryStats = async (req, reply) => {
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
    }
    catch (error) {
        logger_1.logger.error('Error al obtener estadísticas de categorías:', error);
        reply.code(500).send({
            success: false,
            error: 'Error interno del servidor',
        });
    }
};
exports.getCategoryStats = getCategoryStats;
