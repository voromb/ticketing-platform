import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../interfaces/user.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      console.log(`[ACCESS] Acceso denegado: Usuario no autenticado`);
      throw new ForbiddenException('Usuario no autenticado');
    }

    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      console.log(
        `[ACCESS] Acceso denegado: ${user.email} (${user.role}) no tiene permisos. Requerido: ${requiredRoles.join(', ')}`,
      );
      throw new ForbiddenException(
        `No tienes permisos para esta acción. Rol requerido: ${requiredRoles.join(', ')}`,
      );
    }

    console.log(`[ACCESS] Acceso autorizado: ${user.email} (${user.role})`);
    return true;
  }
}
