"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyAdminFiltersSchema = exports.ResetPasswordSchema = exports.UpdatePermissionsSchema = exports.UpdateCompanyAdminSchema = exports.CreateCompanyAdminSchema = void 0;
const zod_1 = require("zod");
// DTO para crear admin de compañía
exports.CreateCompanyAdminSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8).max(100),
    firstName: zod_1.z.string().min(2).max(50),
    lastName: zod_1.z.string().min(2).max(50),
    phone: zod_1.z.string().max(20).optional(),
    companyId: zod_1.z.string().uuid(),
    canCreate: zod_1.z.boolean().optional(),
    canUpdate: zod_1.z.boolean().optional(),
    canDelete: zod_1.z.boolean().optional(),
    canViewStats: zod_1.z.boolean().optional(),
    canManageStock: zod_1.z.boolean().optional()
});
// DTO para actualizar admin de compañía
exports.UpdateCompanyAdminSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2).max(50).optional(),
    lastName: zod_1.z.string().min(2).max(50).optional(),
    phone: zod_1.z.string().max(20).optional(),
    canCreate: zod_1.z.boolean().optional(),
    canUpdate: zod_1.z.boolean().optional(),
    canDelete: zod_1.z.boolean().optional(),
    canViewStats: zod_1.z.boolean().optional(),
    canManageStock: zod_1.z.boolean().optional(),
    isActive: zod_1.z.boolean().optional()
});
// DTO para actualizar permisos
exports.UpdatePermissionsSchema = zod_1.z.object({
    canCreate: zod_1.z.boolean(),
    canUpdate: zod_1.z.boolean(),
    canDelete: zod_1.z.boolean(),
    canViewStats: zod_1.z.boolean(),
    canManageStock: zod_1.z.boolean()
});
// DTO para reset de password
exports.ResetPasswordSchema = zod_1.z.object({
    newPassword: zod_1.z.string().min(8).max(100)
});
// DTO para filtros de búsqueda
exports.CompanyAdminFiltersSchema = zod_1.z.object({
    companyId: zod_1.z.string().uuid().optional(),
    isActive: zod_1.z.boolean().optional(),
    search: zod_1.z.string().optional()
});
