"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const logger_1 = require("../utils/logger");
const prisma = new client_1.PrismaClient();
// ==================== SCHEMAS DE VALIDACIÓN ====================
const createAdminSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email inválido'),
    password: zod_1.z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    firstName: zod_1.z.string().min(2),
    lastName: zod_1.z.string().min(2),
    role: zod_1.z.nativeEnum(client_1.UserRole).default(client_1.UserRole.ADMIN),
});
const updateAdminSchema = zod_1.z.object({
    email: zod_1.z.string().email().optional(),
    firstName: zod_1.z.string().min(2).optional(),
    lastName: zod_1.z.string().min(2).optional(),
    role: zod_1.z.nativeEnum(client_1.UserRole).optional(),
    isActive: zod_1.z.boolean().optional(),
});
const changePasswordSchema = zod_1.z
    .object({
    currentPassword: zod_1.z.string(),
    newPassword: zod_1.z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmPassword: zod_1.z.string(),
})
    .refine(data => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
});
const adminQuerySchema = zod_1.z.object({
    page: zod_1.z.string().optional().default('1').transform(Number),
    limit: zod_1.z.string().optional().default('10').transform(Number),
    search: zod_1.z.string().optional(),
    role: zod_1.z.nativeEnum(client_1.UserRole).optional(),
    isActive: zod_1.z
        .string()
        .optional()
        .transform(val => val === 'true'),
});
class AdminController {
    rabbitmq;
    constructor(rabbitmqService) {
        this.rabbitmq = rabbitmqService;
    }
    /**
     * Crear un nuevo administrador
     */
    async create(request, reply) {
        try {
            // Solo SUPER_ADMIN puede crear otros admins
            if (request.user.role !== 'SUPER_ADMIN') {
                return reply.status(403).send({
                    error: 'No tienes permisos para crear administradores',
                });
            }
            const validatedData = createAdminSchema.parse(request.body);
            // Verificar que el email no exista
            const existingAdmin = await prisma.admin.findUnique({
                where: { email: validatedData.email },
            });
            if (existingAdmin) {
                return reply.status(400).send({
                    error: 'Ya existe un administrador con ese email',
                });
            }
            // Hashear password
            const hashedPassword = await bcryptjs_1.default.hash(validatedData.password, 10);
            // Crear admin
            const admin = await prisma.admin.create({
                data: {
                    ...validatedData,
                    password: hashedPassword,
                },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    isActive: true,
                    createdAt: true,
                },
            });
            // Publicar evento en RabbitMQ
            await this.rabbitmq.publishEvent('admin.created', {
                adminId: admin.id,
                email: admin.email,
                role: admin.role,
                createdBy: request.user.id,
                timestamp: new Date(),
            });
            logger_1.logger.info(`Admin creado: ${admin.id} por: ${request.user.id}`);
            return reply.status(201).send({
                message: 'Administrador creado exitosamente',
                admin,
            });
        }
        catch (error) {
            logger_1.logger.error('Error creando admin:', error);
            if (error.name === 'ZodError') {
                return reply.status(400).send({
                    error: 'Datos inválidos',
                    details: error.errors,
                });
            }
            return reply.status(500).send({
                error: 'Error interno del servidor',
            });
        }
    }
    /**
     * Obtener todos los administradores
     */
    async getAll(request, reply) {
        try {
            // Solo SUPER_ADMIN y ADMIN pueden ver la lista
            if (!['SUPER_ADMIN', 'ADMIN'].includes(request.user.role)) {
                return reply.status(403).send({
                    error: 'No tienes permisos para ver administradores',
                });
            }
            const query = adminQuerySchema.parse(request.query);
            const { page, limit, search, role, isActive } = query;
            // Construir filtros
            const where = {};
            if (typeof isActive === 'boolean') {
                where.isActive = isActive;
            }
            if (role) {
                where.role = role;
            }
            if (search) {
                where.OR = [
                    { email: { contains: search, mode: 'insensitive' } },
                    { firstName: { contains: search, mode: 'insensitive' } },
                    { lastName: { contains: search, mode: 'insensitive' } },
                ];
            }
            // Obtener total
            const total = await prisma.admin.count({ where });
            // Obtener admins paginados
            const admins = await prisma.admin.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    isActive: true,
                    lastLogin: true,
                    createdAt: true,
                    _count: {
                        select: {
                            eventsCreated: true,
                            auditLogs: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
            return reply.send({
                admins,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            });
        }
        catch (error) {
            logger_1.logger.error('Error obteniendo admins:', error);
            return reply.status(500).send({
                error: 'Error interno del servidor',
            });
        }
    }
    /**
     * Obtener perfil del admin actual
     */
    async getProfile(request, reply) {
        try {
            const admin = await prisma.admin.findUnique({
                where: { id: request.user.id },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    isActive: true,
                    lastLogin: true,
                    createdAt: true,
                    _count: {
                        select: {
                            eventsCreated: true,
                            venuesCreated: true,
                            auditLogs: true,
                        },
                    },
                },
            });
            if (!admin) {
                return reply.status(404).send({
                    error: 'Administrador no encontrado',
                });
            }
            // Obtener actividad reciente
            const recentActivity = await prisma.auditLog.findMany({
                where: { adminId: request.user.id },
                orderBy: { createdAt: 'desc' },
                take: 10,
                select: {
                    id: true,
                    tableName: true,
                    action: true,
                    createdAt: true,
                },
            });
            return reply.send({
                admin,
                recentActivity,
            });
        }
        catch (error) {
            logger_1.logger.error('Error obteniendo perfil:', error);
            return reply.status(500).send({
                error: 'Error interno del servidor',
            });
        }
    }
    /**
     * Obtener un administrador por ID
     */
    async getById(request, reply) {
        try {
            // Solo SUPER_ADMIN puede ver detalles de otros admins
            if (request.user.role !== 'SUPER_ADMIN' && request.user.id !== request.params.id) {
                return reply.status(403).send({
                    error: 'No tienes permisos para ver este administrador',
                });
            }
            const { id } = request.params;
            const admin = await prisma.admin.findUnique({
                where: { id },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    isActive: true,
                    lastLogin: true,
                    createdAt: true,
                    eventsCreated: {
                        orderBy: { createdAt: 'desc' },
                        take: 5,
                        select: {
                            id: true,
                            name: true,
                            status: true,
                            eventDate: true,
                        },
                    },
                    venuesCreated: {
                        orderBy: { createdAt: 'desc' },
                        take: 5,
                        select: {
                            id: true,
                            name: true,
                            city: true,
                            capacity: true,
                        },
                    },
                    auditLogs: {
                        orderBy: { createdAt: 'desc' },
                        take: 20,
                        select: {
                            id: true,
                            tableName: true,
                            action: true,
                            createdAt: true,
                        },
                    },
                },
            });
            if (!admin) {
                return reply.status(404).send({
                    error: 'Administrador no encontrado',
                });
            }
            return reply.send({ admin });
        }
        catch (error) {
            logger_1.logger.error('Error obteniendo admin:', error);
            return reply.status(500).send({
                error: 'Error interno del servidor',
            });
        }
    }
    /**
     * Actualizar un administrador
     */
    async update(request, reply) {
        try {
            const { id } = request.params;
            const validatedData = updateAdminSchema.parse(request.body);
            // Verificar permisos
            if (request.user.role !== 'SUPER_ADMIN' && request.user.id !== id) {
                return reply.status(403).send({
                    error: 'No tienes permisos para actualizar este administrador',
                });
            }
            // No permitir que un admin cambie su propio rol
            if (request.user.id === id && validatedData.role) {
                return reply.status(400).send({
                    error: 'No puedes cambiar tu propio rol',
                });
            }
            // Verificar que el admin existe
            const existingAdmin = await prisma.admin.findUnique({
                where: { id },
            });
            if (!existingAdmin) {
                return reply.status(404).send({
                    error: 'Administrador no encontrado',
                });
            }
            // Si se está actualizando el email, verificar que no exista
            if (validatedData.email && validatedData.email !== existingAdmin.email) {
                const emailExists = await prisma.admin.findUnique({
                    where: { email: validatedData.email },
                });
                if (emailExists) {
                    return reply.status(400).send({
                        error: 'Ya existe un administrador con ese email',
                    });
                }
            }
            // Actualizar admin
            const admin = await prisma.admin.update({
                where: { id },
                data: validatedData,
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    isActive: true,
                    updatedAt: true,
                },
            });
            // Publicar evento en RabbitMQ
            await this.rabbitmq.publishEvent('admin.updated', {
                adminId: admin.id,
                updatedBy: request.user.id,
                changes: Object.keys(validatedData),
                timestamp: new Date(),
            });
            logger_1.logger.info(`Admin actualizado: ${admin.id} por: ${request.user.id}`);
            return reply.send({
                message: 'Administrador actualizado exitosamente',
                admin,
            });
        }
        catch (error) {
            logger_1.logger.error('Error actualizando admin:', error);
            if (error.name === 'ZodError') {
                return reply.status(400).send({
                    error: 'Datos inválidos',
                    details: error.errors,
                });
            }
            return reply.status(500).send({
                error: 'Error interno del servidor',
            });
        }
    }
    /**
     * Cambiar contraseña
     */
    async changePassword(request, reply) {
        try {
            const { id } = request.params;
            const validatedData = changePasswordSchema.parse(request.body);
            // Solo puedes cambiar tu propia contraseña
            if (request.user.id !== id) {
                return reply.status(403).send({
                    error: 'Solo puedes cambiar tu propia contraseña',
                });
            }
            // Obtener admin actual
            const admin = await prisma.admin.findUnique({
                where: { id },
            });
            if (!admin) {
                return reply.status(404).send({
                    error: 'Administrador no encontrado',
                });
            }
            // Verificar contraseña actual
            const validPassword = await bcryptjs_1.default.compare(validatedData.currentPassword, admin.password);
            if (!validPassword) {
                return reply.status(400).send({
                    error: 'Contraseña actual incorrecta',
                });
            }
            // Hashear nueva contraseña
            const hashedPassword = await bcryptjs_1.default.hash(validatedData.newPassword, 10);
            // Actualizar contraseña
            await prisma.admin.update({
                where: { id },
                data: { password: hashedPassword },
            });
            // Publicar evento en RabbitMQ
            await this.rabbitmq.publishEvent('admin.password_changed', {
                adminId: id,
                timestamp: new Date(),
            });
            logger_1.logger.info(`Contraseña cambiada para admin: ${id}`);
            return reply.send({
                message: 'Contraseña actualizada exitosamente',
            });
        }
        catch (error) {
            logger_1.logger.error('Error cambiando contraseña:', error);
            if (error.name === 'ZodError') {
                return reply.status(400).send({
                    error: 'Datos inválidos',
                    details: error.errors,
                });
            }
            return reply.status(500).send({
                error: 'Error interno del servidor',
            });
        }
    }
    /**
     * Desactivar un administrador
     */
    async deactivate(request, reply) {
        try {
            // Solo SUPER_ADMIN puede desactivar admins
            if (request.user.role !== 'SUPER_ADMIN') {
                return reply.status(403).send({
                    error: 'No tienes permisos para desactivar administradores',
                });
            }
            const { id } = request.params;
            // No permitir auto-desactivación
            if (request.user.id === id) {
                return reply.status(400).send({
                    error: 'No puedes desactivar tu propia cuenta',
                });
            }
            // Verificar que no sea el último SUPER_ADMIN activo
            const superAdminCount = await prisma.admin.count({
                where: {
                    role: 'SUPER_ADMIN',
                    isActive: true,
                    id: { not: id },
                },
            });
            const adminToDeactivate = await prisma.admin.findUnique({
                where: { id },
            });
            if (adminToDeactivate?.role === 'SUPER_ADMIN' && superAdminCount === 0) {
                return reply.status(400).send({
                    error: 'No se puede desactivar el último SUPER_ADMIN activo',
                });
            }
            // Desactivar admin
            const admin = await prisma.admin.update({
                where: { id },
                data: { isActive: false },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                },
            });
            // Publicar evento en RabbitMQ
            await this.rabbitmq.publishEvent('admin.deactivated', {
                adminId: admin.id,
                deactivatedBy: request.user.id,
                timestamp: new Date(),
            });
            logger_1.logger.info(`Admin desactivado: ${admin.id} por: ${request.user.id}`);
            return reply.send({
                message: 'Administrador desactivado exitosamente',
            });
        }
        catch (error) {
            logger_1.logger.error('Error desactivando admin:', error);
            return reply.status(500).send({
                error: 'Error interno del servidor',
            });
        }
    }
    /**
     * Activar un administrador
     */
    async activate(request, reply) {
        try {
            // Solo SUPER_ADMIN puede activar admins
            if (request.user.role !== 'SUPER_ADMIN') {
                return reply.status(403).send({
                    error: 'No tienes permisos para activar administradores',
                });
            }
            const { id } = request.params;
            const admin = await prisma.admin.update({
                where: { id },
                data: { isActive: true },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                },
            });
            // Publicar evento en RabbitMQ
            await this.rabbitmq.publishEvent('admin.activated', {
                adminId: admin.id,
                activatedBy: request.user.id,
                timestamp: new Date(),
            });
            logger_1.logger.info(`Admin activado: ${admin.id} por: ${request.user.id}`);
            return reply.send({
                message: 'Administrador activado exitosamente',
                admin,
            });
        }
        catch (error) {
            logger_1.logger.error('Error activando admin:', error);
            return reply.status(500).send({
                error: 'Error interno del servidor',
            });
        }
    }
    /**
     * Obtener estadísticas de administradores
     */
    async getStats(request, reply) {
        try {
            // Solo SUPER_ADMIN puede ver estadísticas
            if (request.user.role !== 'SUPER_ADMIN') {
                return reply.status(403).send({
                    error: 'No tienes permisos para ver estadísticas',
                });
            }
            const [total, active, byRole, recentLogins] = await Promise.all([
                prisma.admin.count(),
                prisma.admin.count({ where: { isActive: true } }),
                prisma.admin.groupBy({
                    by: ['role'],
                    _count: true,
                }),
                prisma.admin.findMany({
                    where: {
                        lastLogin: { not: null },
                    },
                    orderBy: { lastLogin: 'desc' },
                    take: 5,
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        lastLogin: true,
                    },
                }),
            ]);
            // Admins más activos (por eventos creados)
            const mostActive = await prisma.admin.findMany({
                where: { isActive: true },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    _count: {
                        select: {
                            eventsCreated: true,
                            venuesCreated: true,
                            auditLogs: true,
                        },
                    },
                },
                orderBy: {
                    eventsCreated: {
                        _count: 'desc',
                    },
                },
                take: 5,
            });
            return reply.send({
                stats: {
                    total,
                    active,
                    inactive: total - active,
                    byRole: byRole.reduce((acc, curr) => {
                        acc[curr.role] = curr._count;
                        return acc;
                    }, {}),
                },
                recentLogins,
                mostActive,
            });
        }
        catch (error) {
            logger_1.logger.error('Error obteniendo estadísticas:', error);
            return reply.status(500).send({
                error: 'Error interno del servidor',
            });
        }
    }
}
exports.AdminController = AdminController;
