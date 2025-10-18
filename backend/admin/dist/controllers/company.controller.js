"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyController = exports.CompanyController = void 0;
const company_service_1 = require("../services/company.service");
class CompanyController {
    /**
     * POST /api/companies - Crear compañía
     */
    async createCompany(request, reply) {
        try {
            const company = await company_service_1.companyService.createCompany(request.body);
            return reply.code(201).send({
                success: true,
                message: 'Compañía creada exitosamente',
                data: company
            });
        }
        catch (error) {
            return reply.code(400).send({
                success: false,
                message: error.message || 'Error al crear compañía'
            });
        }
    }
    /**
     * GET /api/companies - Listar compañías
     */
    async getCompanies(request, reply) {
        try {
            const companies = await company_service_1.companyService.getCompanies(request.query);
            return reply.code(200).send({
                success: true,
                data: companies,
                total: companies.length
            });
        }
        catch (error) {
            return reply.code(500).send({
                success: false,
                message: error.message || 'Error al obtener compañías'
            });
        }
    }
    /**
     * GET /api/companies/:id - Obtener compañía por ID
     */
    async getCompanyById(request, reply) {
        try {
            const company = await company_service_1.companyService.getCompanyById(request.params.id);
            if (!company) {
                return reply.code(404).send({
                    success: false,
                    message: 'Compañía no encontrada'
                });
            }
            return reply.code(200).send({
                success: true,
                data: company
            });
        }
        catch (error) {
            return reply.code(500).send({
                success: false,
                message: error.message || 'Error al obtener compañía'
            });
        }
    }
    /**
     * PATCH /api/companies/:id - Actualizar compañía
     */
    async updateCompany(request, reply) {
        try {
            const company = await company_service_1.companyService.updateCompany(request.params.id, request.body);
            return reply.code(200).send({
                success: true,
                message: 'Compañía actualizada exitosamente',
                data: company
            });
        }
        catch (error) {
            return reply.code(400).send({
                success: false,
                message: error.message || 'Error al actualizar compañía'
            });
        }
    }
    /**
     * DELETE /api/companies/:id - Eliminar compañía (soft delete)
     */
    async deleteCompany(request, reply) {
        try {
            const company = await company_service_1.companyService.deleteCompany(request.params.id);
            return reply.code(200).send({
                success: true,
                message: 'Compañía desactivada exitosamente',
                data: company
            });
        }
        catch (error) {
            return reply.code(400).send({
                success: false,
                message: error.message || 'Error al eliminar compañía'
            });
        }
    }
    /**
     * GET /api/companies/:id/stats - Estadísticas de compañía
     */
    async getCompanyStats(request, reply) {
        try {
            const stats = await company_service_1.companyService.getCompanyStats(request.params.id);
            return reply.code(200).send({
                success: true,
                data: stats
            });
        }
        catch (error) {
            return reply.code(400).send({
                success: false,
                message: error.message || 'Error al obtener estadísticas'
            });
        }
    }
    /**
     * GET /api/companies/stats/global - Estadísticas globales
     */
    async getGlobalStats(request, reply) {
        try {
            const stats = await company_service_1.companyService.getGlobalStats();
            return reply.code(200).send({
                success: true,
                data: stats
            });
        }
        catch (error) {
            return reply.code(500).send({
                success: false,
                message: error.message || 'Error al obtener estadísticas globales'
            });
        }
    }
}
exports.CompanyController = CompanyController;
exports.companyController = new CompanyController();
