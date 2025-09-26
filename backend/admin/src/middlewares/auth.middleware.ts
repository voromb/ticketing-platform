import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import ENV from '../config/env';

// Extender FastifyRequest si no está extendido
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      email: string;
      role: string;
    };
  }
}

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
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
      const decoded = jwt.verify(token, ENV.JWT_SECRET) as any;
      
      // Añadir el usuario al request
      request.user = {
        id: decoded.id || decoded.sub,
        email: decoded.email,
        role: decoded.role || 'USER'
      };
      
    } catch (jwtError: any) {
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
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    return reply.status(500).send({
      error: 'Authentication error'
    });
  }
}

// Middleware opcional (no requiere token pero lo procesa si existe)
export async function optionalAuthMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
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
        const decoded = jwt.verify(token, ENV.JWT_SECRET) as any;
        request.user = {
          id: decoded.id || decoded.sub,
          email: decoded.email,
          role: decoded.role || 'USER'
        };
      } catch {
        // Token inválido, continuar sin usuario
      }
    }
  } catch (error) {
    console.error('Optional auth middleware error:', error);
  }
}

// Exportar por defecto también
export default authMiddleware;
