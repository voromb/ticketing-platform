"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManagementController = void 0;
const zod_1 = require("zod");
const user_api_service_1 = require("../services/user-api.service");
const logger_1 = require("../utils/logger");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Esquemas para validar datos de entrada
const promoteUserSchema = zod_1.z.object({
    reason: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional()
});
const userQuerySchema = zod_1.z.object({
    page: zod_1.z.string().optional().default('1').transform(Number),
    limit: zod_1.z.string().optional().default('10').transform(Number),
    search: zod_1.z.string().optional(),
    role: zod_1.z.enum(['user', 'vip']).optional()
});
class UserManagementController {
    /**
     * Obtener todos los usuarios del user-service
     */
    async getAllUsers(request, reply) {
        try {
            // Solo SUPER_ADMIN y ADMIN pueden ver usuarios
            if (!request.user || !['SUPER_ADMIN', 'ADMIN'].includes(request.user.role)) {
                return reply.status(403).send({
                    error: 'No tienes permisos para ver usuarios'
                });
            }
            const query = userQuerySchema.parse(request.query);
            const { search, role } = query;
            // Registrar la acción en los logs
            // Obtener usuarios del user-service
            const allUsers = await user_api_service_1.userApiService.getUsers();
            // Aplicar filtros localmente
            let filteredUsers = allUsers;
            if (role) {
                filteredUsers = filteredUsers.filter(user => user.role === role);
            }
            if (search) {
                const searchLower = search.toLowerCase();
                filteredUsers = filteredUsers.filter(user => user.username.toLowerCase().includes(searchLower) ||
                    user.email.toLowerCase().includes(searchLower) ||
                    user.firstName?.toLowerCase().includes(searchLower) ||
                    user.lastName?.toLowerCase().includes(searchLower));
            }
            // Paginación local
            const { page, limit } = query;
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
            return reply.send({
                success: true,
                users: paginatedUsers,
                pagination: {
                    total: filteredUsers.length,
                    page,
                    limit,
                    totalPages: Math.ceil(filteredUsers.length / limit)
                },
                source: 'user-service'
            });
        }
        catch (error) {
            logger_1.logger.error({ err: error }, 'Error obteniendo usuarios:');
            return reply.status(500).send({
                error: 'No se pudieron obtener los usuarios del user-service',
                details: error.message
            });
        }
    }
    /**
     * Obtener un usuario específico por ID
     */
    async getUserById(request, reply) {
        try {
            // Solo SUPER_ADMIN y ADMIN pueden ver detalles de usuarios
            if (!request.user || !['SUPER_ADMIN', 'ADMIN'].includes(request.user.role)) {
                return reply.status(403).send({
                    error: 'No tienes permisos para ver detalles de usuarios'
                });
            }
            const { id } = request.params;
            // Registrar consulta en logs
            const user = await user_api_service_1.userApiService.getUserById(id);
            if (!user) {
                return reply.status(404).send({
                    error: 'Usuario no encontrado'
                });
            }
            return reply.send({
                success: true,
                user,
                source: 'user-service'
            });
        }
        catch (error) {
            logger_1.logger.error({ err: error }, `Error obteniendo usuario ${request.params.id}:`);
            return reply.status(500).send({
                error: 'No se pudo obtener el usuario',
                details: error.message
            });
        }
    }
    /**
     * Promocionar un usuario a VIP
     */
    async promoteUserToVip(request, reply) {
        try {
            // Solo SUPER_ADMIN puede promocionar usuarios
            if (!request.user || request.user.role !== 'SUPER_ADMIN') {
                return reply.status(403).send({
                    error: 'Solo SUPER_ADMIN puede promocionar usuarios a VIP'
                });
            }
            const { id } = request.params;
            const validatedData = promoteUserSchema.parse(request.body);
            // Registrar promoción en logs
            // Verificar que el usuario existe antes de promocionar
            const existingUser = await user_api_service_1.userApiService.getUserById(id);
            if (!existingUser) {
                return reply.status(404).send({
                    error: 'Usuario no encontrado'
                });
            }
            // Verificar que no sea ya VIP
            if (existingUser.role === 'vip') {
                return reply.status(400).send({
                    error: 'El usuario ya es VIP'
                });
            }
            // Promocionar usuario via API call
            const promotedUser = await user_api_service_1.userApiService.promoteUserToVip(id, request.user.id);
            // Promoción completada exitosamente
            return reply.send({
                success: true,
                message: 'Usuario promocionado a VIP exitosamente',
                user: promotedUser,
                promotedBy: {
                    adminId: request.user.id,
                    adminEmail: request.user.email
                },
                reason: validatedData.reason,
                notes: validatedData.notes,
                timestamp: new Date()
            });
        }
        catch (error) {
            logger_1.logger.error({ err: error }, `Error promocionando usuario ${request.params.id} a VIP:`);
            if (error.message.includes('Usuario no encontrado')) {
                return reply.status(404).send({
                    error: 'Usuario no encontrado'
                });
            }
            if (error.message.includes('ya es VIP')) {
                return reply.status(400).send({
                    error: 'El usuario ya es VIP'
                });
            }
            return reply.status(500).send({
                error: 'Error promocionando usuario a VIP',
                details: error.message
            });
        }
    }
    /**
     * Degradar un usuario VIP a usuario normal
     */
    async demoteVipToUser(request, reply) {
        try {
            // Solo SUPER_ADMIN puede degradar usuarios
            if (!request.user || request.user.role !== 'SUPER_ADMIN') {
                return reply.status(403).send({
                    error: 'Solo SUPER_ADMIN puede degradar usuarios VIP'
                });
            }
            const { id } = request.params;
            const validatedData = promoteUserSchema.parse(request.body);
            // Registrar degradación en logs
            // Verificar que el usuario existe y es VIP
            const existingUser = await user_api_service_1.userApiService.getUserById(id);
            if (!existingUser) {
                return reply.status(404).send({
                    error: 'Usuario no encontrado'
                });
            }
            if (existingUser.role !== 'vip') {
                return reply.status(400).send({
                    error: 'El usuario no es VIP'
                });
            }
            // Degradar usuario via API call
            const demotedUser = await user_api_service_1.userApiService.demoteVipToUser(id, request.user.id);
            // Degradación completada exitosamente
            return reply.send({
                success: true,
                message: 'Usuario VIP degradado a usuario normal exitosamente',
                user: demotedUser,
                demotedBy: {
                    adminId: request.user.id,
                    adminEmail: request.user.email
                },
                reason: validatedData.reason,
                notes: validatedData.notes,
                timestamp: new Date()
            });
        }
        catch (error) {
            logger_1.logger.error({ err: error }, `Error degradando usuario VIP ${request.params.id}:`);
            if (error.message.includes('Usuario no encontrado')) {
                return reply.status(404).send({
                    error: 'Usuario no encontrado'
                });
            }
            if (error.message.includes('no es VIP')) {
                return reply.status(400).send({
                    error: 'El usuario no es VIP'
                });
            }
            return reply.status(500).send({
                error: 'Error degradando usuario VIP',
                details: error.message
            });
        }
    }
    /**
     * Promocionar un usuario a COMPANY_ADMIN
     */
    async promoteUserToCompanyAdmin(request, reply) {
        try {
            // Solo SUPER_ADMIN puede promocionar usuarios
            if (!request.user || request.user.role !== 'SUPER_ADMIN') {
                return reply.status(403).send({
                    error: 'Solo SUPER_ADMIN puede promocionar usuarios a COMPANY_ADMIN'
                });
            }
            const { id } = request.params;
            const { companyId, serviceType, reason, notes } = request.body;
            // Verificar que el usuario existe en MongoDB Y obtener su contraseña hasheada
            const existingUser = await user_api_service_1.userApiService.getUserWithPassword(id);
            if (!existingUser) {
                return reply.status(404).send({
                    error: 'Usuario no encontrado en MongoDB'
                });
            }
            // Verificar que la compañía existe
            const company = await request.server.prisma.company.findUnique({
                where: { id: companyId }
            });
            if (!company) {
                return reply.status(404).send({
                    error: 'Compañía no encontrada'
                });
            }
            // Verificar que el tipo de servicio coincide
            if (company.type !== serviceType) {
                return reply.status(400).send({
                    error: `La compañía no es de tipo ${serviceType}`
                });
            }
            // Verificar que no existe ya un COMPANY_ADMIN con ese email
            const existingCompanyAdmin = await request.server.prisma.companyAdmin.findUnique({
                where: { email: existingUser.email }
            });
            if (existingCompanyAdmin) {
                return reply.status(400).send({
                    error: 'Ya existe un COMPANY_ADMIN con ese email'
                });
            }
            // Usar la misma contraseña hasheada del usuario de MongoDB
            // Esto permite que el usuario use su contraseña actual para acceder al panel
            if (!existingUser.password) {
                return reply.status(400).send({
                    error: 'No se pudo obtener la contraseña del usuario'
                });
            }
            // Crear COMPANY_ADMIN en PostgreSQL
            const companyAdmin = await request.server.prisma.companyAdmin.create({
                data: {
                    company_id: companyId,
                    email: existingUser.email,
                    password: existingUser.password, // Usar la misma contraseña hasheada
                    first_name: existingUser.firstName || existingUser.username,
                    last_name: existingUser.lastName || '',
                    can_create: true,
                    can_update: true,
                    can_delete: false,
                    can_view_stats: true,
                    can_manage_stock: serviceType === 'MERCHANDISING',
                    is_active: true
                },
                include: {
                    companies: true
                }
            });
            logger_1.logger.info(`Usuario ${existingUser.email} promocionado a COMPANY_ADMIN de ${company.name}`);
            return reply.send({
                success: true,
                message: `Usuario promocionado a COMPANY_ADMIN de ${serviceType} exitosamente`,
                companyAdmin: {
                    id: companyAdmin.id,
                    email: companyAdmin.email,
                    firstName: companyAdmin.first_name,
                    lastName: companyAdmin.last_name,
                    company: {
                        id: company.id,
                        name: company.name,
                        type: company.type,
                        region: company.region
                    },
                    permissions: {
                        canCreate: companyAdmin.can_create,
                        canUpdate: companyAdmin.can_update,
                        canDelete: companyAdmin.can_delete,
                        canViewStats: companyAdmin.can_view_stats,
                        canManageStock: companyAdmin.can_manage_stock
                    }
                },
                mongoUser: {
                    id: existingUser._id,
                    email: existingUser.email,
                    username: existingUser.username
                },
                promotedBy: {
                    adminId: request.user.id,
                    adminEmail: request.user.email
                },
                reason,
                notes,
                timestamp: new Date()
            });
        }
        catch (error) {
            logger_1.logger.error({ err: error }, `Error promocionando usuario ${request.params.id} a COMPANY_ADMIN:`);
            return reply.status(500).send({
                error: 'Error promocionando usuario a COMPANY_ADMIN',
                details: error.message
            });
        }
    }
    /**
     * Degradar COMPANY_ADMIN a usuario normal
     */
    async demoteCompanyAdmin(request, reply) {
        try {
            // Solo SUPER_ADMIN puede degradar
            if (!request.user || request.user.role !== 'SUPER_ADMIN') {
                return reply.status(403).send({
                    error: 'Solo SUPER_ADMIN puede degradar COMPANY_ADMIN'
                });
            }
            const { id } = request.params;
            // Verificar que el COMPANY_ADMIN existe
            const companyAdmin = await request.server.prisma.companyAdmin.findUnique({
                where: { id },
                include: {
                    companies: true
                }
            });
            if (!companyAdmin) {
                return reply.status(404).send({
                    error: 'COMPANY_ADMIN no encontrado'
                });
            }
            // Eliminar el COMPANY_ADMIN de PostgreSQL
            await request.server.prisma.companyAdmin.delete({
                where: { id }
            });
            logger_1.logger.info(`COMPANY_ADMIN ${companyAdmin.email} degradado a usuario normal por ${request.user.email}`);
            return reply.send({
                success: true,
                message: 'Usuario degradado exitosamente a usuario normal',
                email: companyAdmin.email
            });
        }
        catch (error) {
            logger_1.logger.error({ err: error }, `Error degradando COMPANY_ADMIN ${request.params.id}:`);
            return reply.status(500).send({
                error: 'Error degradando COMPANY_ADMIN',
                details: error.message
            });
        }
    }
    /**
     * Obtener todos los COMPANY_ADMIN
     */
    async getCompanyAdmins(request, reply) {
        try {
            // Solo SUPER_ADMIN puede ver la lista de COMPANY_ADMIN
            if (!request.user || request.user.role !== 'SUPER_ADMIN') {
                return reply.status(403).send({
                    error: 'Solo SUPER_ADMIN puede ver la lista de COMPANY_ADMIN'
                });
            }
            const companyAdmins = await request.server.prisma.companyAdmin.findMany({
                include: {
                    companies: true
                },
                orderBy: {
                    created_at: 'desc'
                }
            });
            return reply.send({
                success: true,
                companyAdmins,
                total: companyAdmins.length
            });
        }
        catch (error) {
            logger_1.logger.error({ err: error }, 'Error obteniendo COMPANY_ADMIN:');
            return reply.status(500).send({
                error: 'Error obteniendo COMPANY_ADMIN',
                details: error.message
            });
        }
    }
    /**
     * Obtener estadísticas de usuarios
     */
    async getUserStats(request, reply) {
        try {
            // Solo SUPER_ADMIN y ADMIN pueden ver estadísticas
            if (!request.user || !['SUPER_ADMIN', 'ADMIN'].includes(request.user.role)) {
                return reply.status(403).send({
                    error: 'Solo SUPER_ADMIN y ADMIN pueden ver estadísticas de usuarios',
                });
            }
            // Registrar consulta de estadísticas
            logger_1.logger.info('Consultando estadísticas de usuarios...');
            // TEMPORAL: Datos simulados mientras se arregla el user-service
            // TODO: Restaurar conexión con user-service cuando esté funcionando
            try {
                const allUsers = await user_api_service_1.userApiService.getUsers();
                // Contar COMPANY_ADMIN de PostgreSQL
                const companyAdminCount = await prisma.companyAdmin.count({
                    where: {
                        deleted_at: null
                    }
                });
                const stats = {
                    total: allUsers.length,
                    active: allUsers.filter(user => user.isActive).length,
                    inactive: allUsers.filter(user => !user.isActive).length,
                    byRole: {
                        user: allUsers.filter(user => user.role === 'user').length,
                        vip: allUsers.filter(user => user.role === 'vip').length,
                        company_admin: companyAdminCount,
                    },
                    recentUsers: allUsers
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .slice(0, 5)
                        .map(user => ({
                        _id: user._id,
                        username: user.username,
                        email: user.email,
                        role: user.role,
                        createdAt: user.createdAt,
                    })),
                };
                return reply.send({
                    success: true,
                    stats,
                    source: 'user-service',
                });
            }
            catch (userServiceError) {
                logger_1.logger.error('Error conectando con user-service:', userServiceError);
                return reply.status(500).send({
                    error: 'User service no disponible',
                    details: userServiceError instanceof Error
                        ? userServiceError.message
                        : 'Unknown error',
                });
            }
        }
        catch (error) {
            logger_1.logger.error({ err: error }, 'Error obteniendo estadísticas de usuarios:');
            return reply.status(500).send({
                error: 'Error obteniendo estadísticas de usuarios',
                details: error.message
            });
        }
    }
}
exports.UserManagementController = UserManagementController;
exports.default = new UserManagementController();
