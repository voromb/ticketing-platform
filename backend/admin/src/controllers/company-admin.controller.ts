import { FastifyRequest, FastifyReply } from 'fastify';
import { companyAdminService } from '../services/company-admin.service';
import { 
  CreateCompanyAdminDto, 
  UpdateCompanyAdminDto,
  UpdatePermissionsDto,
  ResetPasswordDto,
  CompanyAdminFiltersDto 
} from '../dto/company-admin.dto';

export class CompanyAdminController {
  /**
   * POST /api/company-admins - Crear admin de compañía
   */
  async createCompanyAdmin(
    request: FastifyRequest<{ Body: CreateCompanyAdminDto }>,
    reply: FastifyReply
  ) {
    try {
      const admin = await companyAdminService.createCompanyAdmin(request.body);
      
      return reply.code(201).send({
        success: true,
        message: 'Administrador de compañía creado exitosamente',
        data: admin
      });
    } catch (error: any) {
      return reply.code(400).send({
        success: false,
        message: error.message || 'Error al crear administrador'
      });
    }
  }

  /**
   * GET /api/company-admins - Listar admins
   */
  async getCompanyAdmins(
    request: FastifyRequest<{ Querystring: CompanyAdminFiltersDto }>,
    reply: FastifyReply
  ) {
    try {
      const admins = await companyAdminService.getCompanyAdmins(request.query);
      
      return reply.code(200).send({
        success: true,
        data: admins,
        total: admins.length
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        message: error.message || 'Error al obtener administradores'
      });
    }
  }

  /**
   * GET /api/company-admins/:id - Obtener admin por ID
   */
  async getCompanyAdminById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const admin = await companyAdminService.getCompanyAdminById(request.params.id);
      
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
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        message: error.message || 'Error al obtener administrador'
      });
    }
  }

  /**
   * PATCH /api/company-admins/:id - Actualizar admin
   */
  async updateCompanyAdmin(
    request: FastifyRequest<{ 
      Params: { id: string };
      Body: UpdateCompanyAdminDto 
    }>,
    reply: FastifyReply
  ) {
    try {
      const admin = await companyAdminService.updateCompanyAdmin(
        request.params.id,
        request.body
      );
      
      return reply.code(200).send({
        success: true,
        message: 'Administrador actualizado exitosamente',
        data: admin
      });
    } catch (error: any) {
      return reply.code(400).send({
        success: false,
        message: error.message || 'Error al actualizar administrador'
      });
    }
  }

  /**
   * PATCH /api/company-admins/:id/permissions - Actualizar permisos
   */
  async updatePermissions(
    request: FastifyRequest<{ 
      Params: { id: string };
      Body: UpdatePermissionsDto 
    }>,
    reply: FastifyReply
  ) {
    try {
      const admin = await companyAdminService.updatePermissions(
        request.params.id,
        request.body
      );
      
      return reply.code(200).send({
        success: true,
        message: 'Permisos actualizados exitosamente',
        data: admin
      });
    } catch (error: any) {
      return reply.code(400).send({
        success: false,
        message: error.message || 'Error al actualizar permisos'
      });
    }
  }

  /**
   * POST /api/company-admins/:id/reset-password - Reset password
   */
  async resetPassword(
    request: FastifyRequest<{ 
      Params: { id: string };
      Body: ResetPasswordDto 
    }>,
    reply: FastifyReply
  ) {
    try {
      const result = await companyAdminService.resetPassword(
        request.params.id,
        request.body
      );
      
      return reply.code(200).send({
        success: true,
        message: result.message
      });
    } catch (error: any) {
      return reply.code(400).send({
        success: false,
        message: error.message || 'Error al resetear contraseña'
      });
    }
  }

  /**
   * DELETE /api/company-admins/:id - Eliminar admin (soft delete)
   */
  async deleteCompanyAdmin(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const admin = await companyAdminService.deleteCompanyAdmin(request.params.id);
      
      return reply.code(200).send({
        success: true,
        message: 'Administrador desactivado exitosamente',
        data: admin
      });
    } catch (error: any) {
      return reply.code(400).send({
        success: false,
        message: error.message || 'Error al eliminar administrador'
      });
    }
  }

  /**
   * GET /api/companies/:companyId/admins - Obtener admins por compañía
   */
  async getAdminsByCompany(
    request: FastifyRequest<{ Params: { companyId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const admins = await companyAdminService.getAdminsByCompany(request.params.companyId);
      
      return reply.code(200).send({
        success: true,
        data: admins,
        total: admins.length
      });
    } catch (error: any) {
      return reply.code(400).send({
        success: false,
        message: error.message || 'Error al obtener administradores'
      });
    }
  }
}

export const companyAdminController = new CompanyAdminController();
