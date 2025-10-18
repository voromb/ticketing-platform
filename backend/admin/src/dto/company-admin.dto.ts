import { z } from 'zod';

// DTO para crear admin de compañía
export const CreateCompanyAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  phone: z.string().max(20).optional(),
  companyId: z.string().uuid(),
  canCreate: z.boolean().optional(),
  canUpdate: z.boolean().optional(),
  canDelete: z.boolean().optional(),
  canViewStats: z.boolean().optional(),
  canManageStock: z.boolean().optional()
});

// DTO para actualizar admin de compañía
export const UpdateCompanyAdminSchema = z.object({
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  phone: z.string().max(20).optional(),
  canCreate: z.boolean().optional(),
  canUpdate: z.boolean().optional(),
  canDelete: z.boolean().optional(),
  canViewStats: z.boolean().optional(),
  canManageStock: z.boolean().optional(),
  isActive: z.boolean().optional()
});

// DTO para actualizar permisos
export const UpdatePermissionsSchema = z.object({
  canCreate: z.boolean(),
  canUpdate: z.boolean(),
  canDelete: z.boolean(),
  canViewStats: z.boolean(),
  canManageStock: z.boolean()
});

// DTO para reset de password
export const ResetPasswordSchema = z.object({
  newPassword: z.string().min(8).max(100)
});

// DTO para filtros de búsqueda
export const CompanyAdminFiltersSchema = z.object({
  companyId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional()
});

export type CreateCompanyAdminDto = z.infer<typeof CreateCompanyAdminSchema>;
export type UpdateCompanyAdminDto = z.infer<typeof UpdateCompanyAdminSchema>;
export type UpdatePermissionsDto = z.infer<typeof UpdatePermissionsSchema>;
export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;
export type CompanyAdminFiltersDto = z.infer<typeof CompanyAdminFiltersSchema>;
