import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token no proporcionado",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "DAW-servidor-2025"
    );
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token inválido",
    });
  }
};

export const roleMiddleware = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "No autorizado",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para esta acción",
      });
    }

    next();
  };
};

// Middleware opcional: procesa el token si existe, pero no falla si no hay
export const optionalAuthMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (token) {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "DAW-servidor-2025"
      );
      req.user = decoded;
      console.log('✅ Token JWT procesado - Usuario:', (decoded as any).id);
    } else {
      console.log('⚠️ No hay token JWT - continuando sin autenticación');
    }
    
    next();
  } catch (error) {
    console.log('⚠️ Token JWT inválido - continuando sin autenticación');
    // No fallar, simplemente continuar sin usuario
    next();
  }
};

// Alias para compatibilidad
export const authenticateToken = authMiddleware;