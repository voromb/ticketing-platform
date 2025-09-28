"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class AuthController {
    server;
    constructor(server) {
        this.server = server;
    }
    async login(request, reply) {
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
        const validPassword = await bcryptjs_1.default.compare(password, admin.password);
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
exports.AuthController = AuthController;
