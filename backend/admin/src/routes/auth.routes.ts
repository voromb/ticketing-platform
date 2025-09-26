import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/auth.controller';

export async function authRoutes(server: FastifyInstance) {
    const authController = new AuthController(server);

    server.post('/login', authController.login.bind(authController));
}
