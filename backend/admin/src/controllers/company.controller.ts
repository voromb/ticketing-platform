import { FastifyRequest, FastifyReply } from 'fastify';
import { companyService } from '../services/company.service';
import { CreateCompanyDto, UpdateCompanyDto, CompanyFiltersDto } from '../dto/company.dto';

export class CompanyController {
  /**
   * POST /api/companies - Crear compañía
   */
  async createCompany(
    request: FastifyRequest<{ Body: CreateCompanyDto }>,
    reply: FastifyReply
  ) {
    try {
      const company = await companyService.createCompany(request.body);
      
      return reply.code(201).send({
        success: true,
        message: 'Compañía creada exitosamente',
        data: company
      });
    } catch (error: any) {
      return reply.code(400).send({
        success: false,
        message: error.message || 'Error al crear compañía'
      });
    }
  }

  /**
   * GET /api/companies - Listar compañías
   */
  async getCompanies(
    request: FastifyRequest<{ Querystring: CompanyFiltersDto }>,
    reply: FastifyReply
  ) {
    try {
      const companies = await companyService.getCompanies(request.query);
      
      return reply.code(200).send({
        success: true,
        data: companies,
        total: companies.length
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        message: error.message || 'Error al obtener compañías'
      });
    }
  }

  /**
   * GET /api/companies/:id - Obtener compañía por ID
   */
  async getCompanyById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const company = await companyService.getCompanyById(request.params.id);
      
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
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        message: error.message || 'Error al obtener compañía'
      });
    }
  }

  /**
   * PATCH /api/companies/:id - Actualizar compañía
   */
  async updateCompany(
    request: FastifyRequest<{ 
      Params: { id: string };
      Body: UpdateCompanyDto 
    }>,
    reply: FastifyReply
  ) {
    try {
      const company = await companyService.updateCompany(
        request.params.id,
        request.body
      );
      
      return reply.code(200).send({
        success: true,
        message: 'Compañía actualizada exitosamente',
        data: company
      });
    } catch (error: any) {
      return reply.code(400).send({
        success: false,
        message: error.message || 'Error al actualizar compañía'
      });
    }
  }

  /**
   * DELETE /api/companies/:id - Eliminar compañía (soft delete)
   */
  async deleteCompany(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const company = await companyService.deleteCompany(request.params.id);
      
      return reply.code(200).send({
        success: true,
        message: 'Compañía desactivada exitosamente',
        data: company
      });
    } catch (error: any) {
      return reply.code(400).send({
        success: false,
        message: error.message || 'Error al eliminar compañía'
      });
    }
  }

  /**
   * GET /api/companies/:id/stats - Estadísticas de compañía
   */
  async getCompanyStats(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const stats = await companyService.getCompanyStats(request.params.id);
      
      return reply.code(200).send({
        success: true,
        data: stats
      });
    } catch (error: any) {
      return reply.code(400).send({
        success: false,
        message: error.message || 'Error al obtener estadísticas'
      });
    }
  }

  /**
   * GET /api/companies/stats/global - Estadísticas globales
   */
  async getGlobalStats(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const stats = await companyService.getGlobalStats();
      
      return reply.code(200).send({
        success: true,
        data: stats
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        message: error.message || 'Error al obtener estadísticas globales'
      });
    }
  }
}

export const companyController = new CompanyController();
