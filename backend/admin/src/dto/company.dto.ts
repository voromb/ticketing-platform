import { z } from 'zod';

// Enum para tipos de compañía
export const CompanyTypeSchema = z.enum(['RESTAURANT', 'TRAVEL', 'MERCHANDISING']);

// Enum para regiones
export const CompanyRegionSchema = z.enum(['SPAIN', 'EUROPE', 'AMERICA', 'ASIA', 'AFRICA', 'OCEANIA']);

// DTO para crear compañía
export const CreateCompanySchema = z.object({
  name: z.string().min(3).max(100),
  type: CompanyTypeSchema,
  region: CompanyRegionSchema,
  description: z.string().max(500).optional(),
  contactEmail: z.string().email(),
  contactPhone: z.string().max(20).optional(),
  address: z.string().max(200).optional(),
  taxId: z.string().max(50).optional(),
  requiresApprovalForCreate: z.boolean().optional(),
  requiresApprovalForDelete: z.boolean().optional()
});

// DTO para actualizar compañía
export const UpdateCompanySchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().max(500).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().max(20).optional(),
  address: z.string().max(200).optional(),
  taxId: z.string().max(50).optional(),
  requiresApprovalForCreate: z.boolean().optional(),
  requiresApprovalForDelete: z.boolean().optional(),
  isActive: z.boolean().optional()
});

// DTO para filtros de búsqueda
export const CompanyFiltersSchema = z.object({
  type: CompanyTypeSchema.optional(),
  region: CompanyRegionSchema.optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional()
});

export type CreateCompanyDto = z.infer<typeof CreateCompanySchema>;
export type UpdateCompanyDto = z.infer<typeof UpdateCompanySchema>;
export type CompanyFiltersDto = z.infer<typeof CompanyFiltersSchema>;
