"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyFiltersSchema = exports.UpdateCompanySchema = exports.CreateCompanySchema = exports.CompanyRegionSchema = exports.CompanyTypeSchema = void 0;
const zod_1 = require("zod");
// Enum para tipos de compañía
exports.CompanyTypeSchema = zod_1.z.enum(['RESTAURANT', 'TRAVEL', 'MERCHANDISING']);
// Enum para regiones
exports.CompanyRegionSchema = zod_1.z.enum(['SPAIN', 'EUROPE', 'AMERICA', 'ASIA', 'AFRICA', 'OCEANIA']);
// DTO para crear compañía
exports.CreateCompanySchema = zod_1.z.object({
    name: zod_1.z.string().min(3).max(100),
    type: exports.CompanyTypeSchema,
    region: exports.CompanyRegionSchema,
    description: zod_1.z.string().max(500).optional(),
    contactEmail: zod_1.z.string().email(),
    contactPhone: zod_1.z.string().max(20).optional(),
    address: zod_1.z.string().max(200).optional(),
    taxId: zod_1.z.string().max(50).optional(),
    requiresApprovalForCreate: zod_1.z.boolean().optional(),
    requiresApprovalForDelete: zod_1.z.boolean().optional()
});
// DTO para actualizar compañía
exports.UpdateCompanySchema = zod_1.z.object({
    name: zod_1.z.string().min(3).max(100).optional(),
    description: zod_1.z.string().max(500).optional(),
    contactEmail: zod_1.z.string().email().optional(),
    contactPhone: zod_1.z.string().max(20).optional(),
    address: zod_1.z.string().max(200).optional(),
    taxId: zod_1.z.string().max(50).optional(),
    requiresApprovalForCreate: zod_1.z.boolean().optional(),
    requiresApprovalForDelete: zod_1.z.boolean().optional(),
    isActive: zod_1.z.boolean().optional()
});
// DTO para filtros de búsqueda
exports.CompanyFiltersSchema = zod_1.z.object({
    type: exports.CompanyTypeSchema.optional(),
    region: exports.CompanyRegionSchema.optional(),
    isActive: zod_1.z.boolean().optional(),
    search: zod_1.z.string().optional()
});
