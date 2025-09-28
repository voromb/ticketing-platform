"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.optionalAuthMiddleware = optionalAuthMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = __importDefault(require("../config/env"));
async function authMiddleware(request, reply) {
    try {
        // Obtener el token del header
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            return reply.status(401).send({
                error: 'No authorization header provided'
            });
        }
        // Verificar formato Bearer token
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return reply.status(401).send({
                error: 'Invalid authorization format. Use: Bearer <token>'
            });
        }
        const token = parts[1];
        // Verificar el token
        try {
            const decoded = jsonwebtoken_1.default.verify(token, env_1.default.JWT_SECRET);
            // Añadir el usuario al request
            request.user = {
                id: decoded.id || decoded.sub || '',
                email: decoded.email || '',
                role: decoded.role || 'USER'
            };
        }
        catch (jwtError) {
            if (jwtError.name === 'TokenExpiredError') {
                return reply.status(401).send({
                    error: 'Token expired'
                });
            }
            if (jwtError.name === 'JsonWebTokenError') {
                return reply.status(401).send({
                    error: 'Invalid token'
                });
            }
            throw jwtError;
        }
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        return reply.status(500).send({
            error: 'Authentication error'
        });
    }
}
// Middleware opcional (no requiere token pero lo procesa si existe)
async function optionalAuthMiddleware(request, reply) {
    try {
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            // No hay token, continuar sin usuario
            return;
        }
        const parts = authHeader.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
            const token = parts[1];
            try {
                const decoded = jsonwebtoken_1.default.verify(token, env_1.default.JWT_SECRET);
                request.user = {
                    id: decoded.id || decoded.sub || '',
                    email: decoded.email || '',
                    role: decoded.role || 'USER'
                };
            }
            catch {
                // Token inválido, continuar sin usuario
            }
        }
    }
    catch (error) {
        console.error('Optional auth middleware error:', error);
    }
}
// Exportar por defecto también
exports.default = authMiddleware;
