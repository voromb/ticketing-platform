"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyService = exports.CompanyService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class CompanyService {
    /**
     * Crear una nueva compañía
     */
    async createCompany(data) {
        // Verificar que no exista ya una compañía con el mismo tipo y región
        const existing = await prisma.company.findUnique({
            where: {
                type_region: {
                    type: data.type,
                    region: data.region
                }
            }
        });
        if (existing) {
            throw new Error(`Ya existe una compañía de tipo ${data.type} en la región ${data.region}`);
        }
        return await prisma.company.create({
            data: {
                name: data.name,
                type: data.type,
                region: data.region,
                description: data.description,
                contactEmail: data.contactEmail,
                contactPhone: data.contactPhone,
                address: data.address,
                taxId: data.taxId,
                requiresApprovalForCreate: data.requiresApprovalForCreate ?? true,
                requiresApprovalForDelete: data.requiresApprovalForDelete ?? true
            }
        });
    }
    /**
     * Obtener todas las compañías con filtros opcionales
     */
    async getCompanies(filters) {
        const where = {};
        if (filters?.type) {
            where.type = filters.type;
        }
        if (filters?.region) {
            where.region = filters.region;
        }
        if (filters?.isActive !== undefined) {
            where.isActive = filters.isActive;
        }
        if (filters?.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } }
            ];
        }
        return await prisma.company.findMany({
            where,
            include: {
                companyAdmins: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        isActive: true
                    }
                }
            },
            orderBy: [
                { region: 'asc' },
                { type: 'asc' }
            ]
        });
    }
    /**
     * Obtener una compañía por ID
     */
    async getCompanyById(id) {
        return await prisma.company.findUnique({
            where: { id },
            include: {
                companyAdmins: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                        isActive: true,
                        lastLogin: true,
                        createdAt: true
                    }
                }
            }
        });
    }
    /**
     * Actualizar una compañía
     */
    async updateCompany(id, data) {
        const company = await this.getCompanyById(id);
        if (!company) {
            throw new Error('Compañía no encontrada');
        }
        return await prisma.company.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                contactEmail: data.contactEmail,
                contactPhone: data.contactPhone,
                address: data.address,
                taxId: data.taxId,
                requiresApprovalForCreate: data.requiresApprovalForCreate,
                requiresApprovalForDelete: data.requiresApprovalForDelete,
                isActive: data.isActive
            }
        });
    }
    /**
     * Eliminar una compañía (soft delete)
     */
    async deleteCompany(id) {
        const company = await this.getCompanyById(id);
        if (!company) {
            throw new Error('Compañía no encontrada');
        }
        // Verificar si tiene admins activos
        const activeAdmins = await prisma.companyAdmin.count({
            where: {
                companyId: id,
                isActive: true
            }
        });
        if (activeAdmins > 0) {
            throw new Error('No se puede eliminar una compañía con administradores activos');
        }
        return await prisma.company.update({
            where: { id },
            data: { isActive: false }
        });
    }
    /**
     * Obtener estadísticas de una compañía
     */
    async getCompanyStats(id) {
        const company = await this.getCompanyById(id);
        if (!company) {
            throw new Error('Compañía no encontrada');
        }
        const totalAdmins = await prisma.companyAdmin.count({
            where: { companyId: id }
        });
        const activeAdmins = await prisma.companyAdmin.count({
            where: {
                companyId: id,
                isActive: true
            }
        });
        return {
            company: {
                id: company.id,
                name: company.name,
                type: company.type,
                region: company.region
            },
            stats: {
                totalAdmins,
                activeAdmins,
                inactiveAdmins: totalAdmins - activeAdmins
            }
        };
    }
    /**
     * Obtener estadísticas globales de todas las compañías
     */
    async getGlobalStats() {
        const totalCompanies = await prisma.company.count();
        const activeCompanies = await prisma.company.count({
            where: { isActive: true }
        });
        const byType = await prisma.company.groupBy({
            by: ['type'],
            _count: true,
            where: { isActive: true }
        });
        const byRegion = await prisma.company.groupBy({
            by: ['region'],
            _count: true,
            where: { isActive: true }
        });
        return {
            total: totalCompanies,
            active: activeCompanies,
            inactive: totalCompanies - activeCompanies,
            byType: byType.map(item => ({
                type: item.type,
                count: item._count
            })),
            byRegion: byRegion.map(item => ({
                region: item.region,
                count: item._count
            }))
        };
    }
}
exports.CompanyService = CompanyService;
exports.companyService = new CompanyService();
