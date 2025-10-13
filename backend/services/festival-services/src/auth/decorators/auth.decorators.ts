import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse, ApiForbiddenResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { UserRole } from '../interfaces/user.interface';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

export function Auth(...roles: UserRole[]) {
  return applyDecorators(
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(...roles),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'No autorizado' }),
    ApiForbiddenResponse({ description: 'Acceso denegado' }),
  );
}

// Decoradores específicos para cada rol
export const AdminOnly = () => Auth(UserRole.ADMIN);
export const ModeratorOrAdmin = () => Auth(UserRole.MODERATOR, UserRole.ADMIN);
export const AuthenticatedOnly = () => Auth(UserRole.USER, UserRole.MODERATOR, UserRole.ADMIN);
