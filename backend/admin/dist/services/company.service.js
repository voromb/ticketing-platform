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
        const existing = await prisma.company.findFirst({
            where: {
                type: data.type,
                region: data.region
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
                contact_email: data.contactEmail,
                contact_phone: data.contactPhone,
                address: data.address
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
            where.is_active = filters.isActive;
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
                company_admins: {
                    select: {
                        id: true,
                        email: true,
                        first_name: true,
                        last_name: true,
                        is_active: true
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
                company_admins: {
                    select: {
                        id: true,
                        email: true,
                        first_name: true,
                        last_name: true,
                        is_active: true,
                        last_login: true,
                        created_at: true
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
                contact_email: data.contactEmail,
                contact_phone: data.contactPhone,
                address: data.address,
                is_active: data.isActive
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
                company_id: id,
                is_active: true
            }
        });
        if (activeAdmins > 0) {
            throw new Error('No se puede eliminar una compañía con administradores activos');
        }
        return await prisma.company.update({
            where: { id },
            data: { is_active: false }
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
            where: { company_id: id }
        });
        const activeAdmins = await prisma.companyAdmin.count({
            where: {
                company_id: id,
                is_active: true
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
            where: { is_active: true }
        });
        const byType = await prisma.company.groupBy({
            by: ['type'],
            _count: true,
            where: { is_active: true }
        });
        const byRegion = await prisma.company.groupBy({
            by: ['region'],
            _count: true,
            where: { is_active: true }
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
