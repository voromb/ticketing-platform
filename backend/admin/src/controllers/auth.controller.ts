// @ts-nocheck - Legacy file with type issues, to be refactored
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import bcrypt from 'bcryptjs';
import { config } from '../config/env';

interface LoginBody {
    email: string;
    password: string;
}

export class AuthController {
    constructor(private server: FastifyInstance) {}

    async login(request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) {
        const { email, password } = request.body;

        // Primero intentar buscar en Admin (SUPER_ADMIN, ADMIN, etc.)
        const admin = await this.server.prisma.admin.findUnique({
            where: { email },
        });

        if (admin && admin.isActive) {
            const validPassword = await bcrypt.compare(password, admin.password);
            if (validPassword) {
                const token = this.server.jwt.sign({
                    id: admin.id,
                    email: admin.email,
                    role: admin.role,
                    userType: 'ADMIN',
                });

                return {
                    admin: {
                        id: admin.id,
                        email: admin.email,
                        firstName: admin.firstName,
                        lastName: admin.lastName,
                        role: admin.role,
                    },
                    token,
                };
            }
        }

        // Si no es Admin, intentar buscar en CompanyAdmin
        const companyAdmin = await this.server.prisma.companyAdmin.findUnique({
            where: { email },
            include: {
                companies: true,
            },
        });

        if (!companyAdmin || !companyAdmin.is_active) {
            return reply.status(401).send({
                statusCode: 401,
                error: 'Unauthorized',
                message: 'Invalid credentials',
            });
        }

        const validPassword = await bcrypt.compare(password, companyAdmin.password);
        if (!validPassword) {
            return reply.status(401).send({
                statusCode: 401,
                error: 'Unauthorized',
                message: 'Invalid credentials',
            });
        }

        // Actualizar last_login
        await this.server.prisma.companyAdmin.update({
            where: { id: companyAdmin.id },
            data: { last_login: new Date() },
        });

        const token = this.server.jwt.sign({
            id: companyAdmin.id,
            email: companyAdmin.email,
            role: 'COMPANY_ADMIN',
            companyId: companyAdmin.company_id,
            companyType: companyAdmin.companies.type,
            userType: 'COMPANY_ADMIN',
        });

        return {
            admin: {
                id: companyAdmin.id,
                email: companyAdmin.email,
                firstName: companyAdmin.first_name,
                lastName: companyAdmin.last_name,
                role: 'COMPANY_ADMIN',
                companyId: companyAdmin.company_id,
                companyType: companyAdmin.companies.type,
                companyName: companyAdmin.companies.name,
                permissions: {
                    canCreate: companyAdmin.can_create,
                    canUpdate: companyAdmin.can_update,
                    canDelete: companyAdmin.can_delete,
                    canViewStats: companyAdmin.can_view_stats,
                    canManageStock: companyAdmin.can_manage_stock,
                },
            },
            token,
        };
    }
}
