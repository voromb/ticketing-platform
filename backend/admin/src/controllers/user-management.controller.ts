import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { userApiService, UserServiceUser } from '../services/user-api.service';
import logger from '../utils/logger';

// ==================== SCHEMAS DE VALIDACIÓN ====================
const promoteUserSchema = z.object({
    reason: z.string().optional(),
    notes: z.string().optional()
});

const userQuerySchema = z.object({
    page: z.string().optional().default('1').transform(Number),
    limit: z.string().optional().default('10').transform(Number),
    search: z.string().optional(),
    role: z.enum(['user', 'vip']).optional()
});

// ==================== TYPES ====================
type PromoteUserDTO = z.infer<typeof promoteUserSchema>;
type UserQueryDTO = z.infer<typeof userQuerySchema>;

export class UserManagementController {
    
    /**
     * Obtener todos los usuarios del user-service
     */
    async getAllUsers(request: FastifyRequest<{ Querystring: UserQueryDTO }>, reply: FastifyReply) {
        try {
            // Solo SUPER_ADMIN y ADMIN pueden ver usuarios
            if (!['SUPER_ADMIN', 'ADMIN'].includes(request.user.role)) {
                return reply.status(403).send({
                    error: 'No tienes permisos para ver usuarios'
                });
            }

            const query = userQuerySchema.parse(request.query);
            const { search, role } = query;

            logger.info(`Admin ${request.user.id} consultando usuarios del user-service`);

            // Obtener usuarios del user-service
            const allUsers = await userApiService.getUsers();

            // Aplicar filtros localmente
            let filteredUsers = allUsers;

            if (role) {
                filteredUsers = filteredUsers.filter(user => user.role === role);
            }

            if (search) {
                const searchLower = search.toLowerCase();
                filteredUsers = filteredUsers.filter(user =>
                    user.username.toLowerCase().includes(searchLower) ||
                    user.email.toLowerCase().includes(searchLower) ||
                    user.firstName?.toLowerCase().includes(searchLower) ||
                    user.lastName?.toLowerCase().includes(searchLower)
                );
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

        } catch (error: any) {
            logger.error('Error obteniendo usuarios:', error);
            return reply.status(500).send({
                error: 'No se pudieron obtener los usuarios del user-service',
                details: error.message
            });
        }
    }

    /**
     * Obtener un usuario específico por ID
     */
    async getUserById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        try {
            // Solo SUPER_ADMIN y ADMIN pueden ver detalles de usuarios
            if (!['SUPER_ADMIN', 'ADMIN'].includes(request.user.role)) {
                return reply.status(403).send({
                    error: 'No tienes permisos para ver detalles de usuarios'
                });
            }

            const { id } = request.params;

            logger.info(`Admin ${request.user.id} consultando usuario ${id} del user-service`);

            const user = await userApiService.getUserById(id);

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

        } catch (error: any) {
            logger.error(`Error obteniendo usuario ${request.params.id}:`, error);
            return reply.status(500).send({
                error: 'No se pudo obtener el usuario',
                details: error.message
            });
        }
    }

    /**
     * Promocionar un usuario a VIP
     */
    async promoteUserToVip(
        request: FastifyRequest<{ 
            Params: { id: string }; 
            Body: PromoteUserDTO 
        }>, 
        reply: FastifyReply
    ) {
        try {
            // Solo SUPER_ADMIN puede promocionar usuarios
            if (request.user.role !== 'SUPER_ADMIN') {
                return reply.status(403).send({
                    error: 'Solo SUPER_ADMIN puede promocionar usuarios a VIP'
                });
            }

            const { id } = request.params;
            const validatedData = promoteUserSchema.parse(request.body);

            logger.info(`Admin ${request.user.id} promocionando usuario ${id} a VIP`);

            // Verificar que el usuario existe antes de promocionar
            const existingUser = await userApiService.getUserById(id);
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
            const promotedUser = await userApiService.promoteUserToVip(id, request.user.id);

            logger.info(`Usuario ${id} promocionado a VIP exitosamente por admin ${request.user.id}`);

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

        } catch (error: any) {
            logger.error(`Error promocionando usuario ${request.params.id} a VIP:`, error);
            
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
    async demoteVipToUser(
        request: FastifyRequest<{ 
            Params: { id: string }; 
            Body: PromoteUserDTO 
        }>, 
        reply: FastifyReply
    ) {
        try {
            // Solo SUPER_ADMIN puede degradar usuarios
            if (request.user.role !== 'SUPER_ADMIN') {
                return reply.status(403).send({
                    error: 'Solo SUPER_ADMIN puede degradar usuarios VIP'
                });
            }

            const { id } = request.params;
            const validatedData = promoteUserSchema.parse(request.body);

            logger.info(`Admin ${request.user.id} degradando usuario VIP ${id} a usuario normal`);

            // Verificar que el usuario existe y es VIP
            const existingUser = await userApiService.getUserById(id);
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
            const demotedUser = await userApiService.demoteVipToUser(id, request.user.id);

            logger.info(`Usuario VIP ${id} degradado a usuario normal por admin ${request.user.id}`);

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

        } catch (error: any) {
            logger.error(`Error degradando usuario VIP ${request.params.id}:`, error);
            
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
     * Obtener estadísticas de usuarios
     */
    async getUserStats(request: FastifyRequest, reply: FastifyReply) {
        try {
            // Solo SUPER_ADMIN puede ver estadísticas
            if (request.user.role !== 'SUPER_ADMIN') {
                return reply.status(403).send({
                    error: 'Solo SUPER_ADMIN puede ver estadísticas de usuarios'
                });
            }

            logger.info(`Admin ${request.user.id} consultando estadísticas de usuarios`);

            const allUsers = await userApiService.getUsers();

            const stats = {
                total: allUsers.length,
                active: allUsers.filter(user => user.isActive).length,
                inactive: allUsers.filter(user => !user.isActive).length,
                byRole: {
                    user: allUsers.filter(user => user.role === 'user').length,
                    vip: allUsers.filter(user => user.role === 'vip').length
                },
                recentUsers: allUsers
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 5)
                    .map(user => ({
                        _id: user._id,
                        username: user.username,
                        email: user.email,
                        role: user.role,
                        createdAt: user.createdAt
                    }))
            };

            return reply.send({
                success: true,
                stats,
                source: 'user-service'
            });

        } catch (error: any) {
            logger.error('Error obteniendo estadísticas de usuarios:', error);
            return reply.status(500).send({
                error: 'Error obteniendo estadísticas de usuarios',
                details: error.message
            });
        }
    }
}

export default new UserManagementController();
