"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyAdminController = exports.CompanyAdminController = void 0;
const company_admin_service_1 = require("../services/company-admin.service");
class CompanyAdminController {
    /**
     * POST /api/company-admins - Crear admin de compañía
     */
    async createCompanyAdmin(request, reply) {
        try {
            const admin = await company_admin_service_1.companyAdminService.createCompanyAdmin(request.body);
            return reply.code(201).send({
                success: true,
                message: 'Administrador de compañía creado exitosamente',
                data: admin
            });
        }
        catch (error) {
            return reply.code(400).send({
                success: false,
                message: error.message || 'Error al crear administrador'
            });
        }
    }
    /**
     * GET /api/company-admins - Listar admins
     */
    async getCompanyAdmins(request, reply) {
        try {
            const admins = await company_admin_service_1.companyAdminService.getCompanyAdmins(request.query);
            return reply.code(200).send({
                success: true,
                data: admins,
                total: admins.length
            });
        }
        catch (error) {
            return reply.code(500).send({
                success: false,
                message: error.message || 'Error al obtener administradores'
            });
        }
    }
    /**
     * GET /api/company-admins/:id - Obtener admin por ID
     */
    async getCompanyAdminById(request, reply) {
        try {
            const admin = await company_admin_service_1.companyAdminService.getCompanyAdminById(request.params.id);
            if (!admin) {
                return reply.code(404).send({
                    success: false,
                    message: 'Administrador no encontrado'
                });
            }
            return reply.code(200).send({
                success: true,
                data: admin
            });
        }
        catch (error) {
            return reply.code(500).send({
                success: false,
                message: error.message || 'Error al obtener administrador'
            });
        }
    }
    /**
     * PATCH /api/company-admins/:id - Actualizar admin
     */
    async updateCompanyAdmin(request, reply) {
        try {
            const admin = await company_admin_service_1.companyAdminService.updateCompanyAdmin(request.params.id, request.body);
            return reply.code(200).send({
                success: true,
                message: 'Administrador actualizado exitosamente',
                data: admin
            });
        }
        catch (error) {
            return reply.code(400).send({
                success: false,
                message: error.message || 'Error al actualizar administrador'
            });
        }
    }
    /**
     * PATCH /api/company-admins/:id/permissions - Actualizar permisos
     */
    async updatePermissions(request, reply) {
        try {
            const admin = await company_admin_service_1.companyAdminService.updatePermissions(request.params.id, request.body);
            return reply.code(200).send({
                success: true,
                message: 'Permisos actualizados exitosamente',
                data: admin
            });
        }
        catch (error) {
            return reply.code(400).send({
                success: false,
                message: error.message || 'Error al actualizar permisos'
            });
        }
    }
    /**
     * POST /api/company-admins/:id/reset-password - Reset password
     */
    async resetPassword(request, reply) {
        try {
            const result = await company_admin_service_1.companyAdminService.resetPassword(request.params.id, request.body);
            return reply.code(200).send({
                success: true,
                message: result.message
            });
        }
        catch (error) {
            return reply.code(400).send({
                success: false,
                message: error.message || 'Error al resetear contraseña'
            });
        }
    }
    /**
     * DELETE /api/company-admins/:id - Eliminar admin (soft delete)
     */
    async deleteCompanyAdmin(request, reply) {
        try {
            const admin = await company_admin_service_1.companyAdminService.deleteCompanyAdmin(request.params.id);
            return reply.code(200).send({
                success: true,
                message: 'Administrador desactivado exitosamente',
                data: admin
            });
        }
        catch (error) {
            return reply.code(400).send({
                success: false,
                message: error.message || 'Error al eliminar administrador'
            });
        }
    }
    /**
     * GET /api/companies/:companyId/admins - Obtener admins por compañía
     */
    async getAdminsByCompany(request, reply) {
        try {
            const admins = await company_admin_service_1.companyAdminService.getAdminsByCompany(request.params.companyId);
            return reply.code(200).send({
                success: true,
                data: admins,
                total: admins.length
            });
        }
        catch (error) {
            return reply.code(400).send({
                success: false,
                message: error.message || 'Error al obtener administradores'
            });
        }
    }
}
exports.CompanyAdminController = CompanyAdminController;
exports.companyAdminController = new CompanyAdminController();
