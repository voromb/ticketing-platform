import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export type Permission = 'canCreate' | 'canUpdate' | 'canDelete' | 'canViewStats' | 'canManageStock';

export const PERMISSIONS_KEY = 'permissions';

@Injectable()
export class CompanyPermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const companyAdmin = request.companyAdmin;

    if (!companyAdmin) {
      throw new ForbiddenException('No se encontró información del administrador');
    }

    const hasPermission = requiredPermissions.every(
      (permission) => companyAdmin.permissions[permission] === true,
    );

    if (!hasPermission) {
      throw new ForbiddenException('No tienes permisos suficientes para esta acción');
    }

    return true;
  }
}
