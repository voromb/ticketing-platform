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

        const admin = await this.server.prisma.admin.findUnique({
            where: { email },
        });

        if (!admin || !admin.isActive) {
            return reply.status(401).send({
                statusCode: 401,
                error: 'Unauthorized',
                message: 'Invalid credentials',
            });
        }

        const validPassword = await bcrypt.compare(password, admin.password);
        if (!validPassword) {
            return reply.status(401).send({
                statusCode: 401,
                error: 'Unauthorized',
                message: 'Invalid credentials',
            });
        }

        const token = this.server.jwt.sign({
            id: admin.id,
            email: admin.email,
            role: admin.role,
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
