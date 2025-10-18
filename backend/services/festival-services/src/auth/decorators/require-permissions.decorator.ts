import { SetMetadata } from '@nestjs/common';
import { Permission, PERMISSIONS_KEY } from '../guards/company-permission.guard';

export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
