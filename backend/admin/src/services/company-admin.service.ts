import { PrismaClient, CompanyAdmin } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { 
  CreateCompanyAdminDto, 
  UpdateCompanyAdminDto, 
  UpdatePermissionsDto,
  ResetPasswordDto,
  CompanyAdminFiltersDto 
} from '../dto/company-admin.dto';

const prisma = new PrismaClient();

export class CompanyAdminService {
  /**
   * Crear un nuevo admin de compañía
   */
  async createCompanyAdmin(data: CreateCompanyAdminDto): Promise<Omit<CompanyAdmin, 'password'>> {
    // Verificar que el email no exista
    const existingAdmin = await prisma.companyAdmin.findUnique({
      where: { email: data.email }
    });

    if (existingAdmin) {
      throw new Error('Ya existe un administrador con este email');
    }

    // Verificar que la compañía existe
    const company = await prisma.company.findUnique({
      where: { id: data.companyId }
    });

    if (!company) {
      throw new Error('Compañía no encontrada');
    }

    if (!company.is_active) {
      throw new Error('No se puede crear un administrador para una compañía inactiva');
    }

    // Hash del password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const admin = await prisma.companyAdmin.create({
      data: {
        email: data.email,
        password: hashedPassword,
        first_name: data.firstName,
        last_name: data.lastName,
        company_id: data.companyId,
        can_create: data.canCreate ?? true,
        can_update: data.canUpdate ?? true,
        can_delete: data.canDelete ?? false,
        can_view_stats: data.canViewStats ?? true,
        can_manage_stock: data.canManageStock ?? true
      }
    });

    // Remover password de la respuesta
    const { password, ...adminWithoutPassword } = admin;
    return adminWithoutPassword;
  }

  /**
   * Obtener todos los admins con filtros opcionales
   */
  async getCompanyAdmins(filters?: CompanyAdminFiltersDto) {
    const where: any = {};

    if (filters?.companyId) {
      where.company_id = filters.companyId;
    }

    if (filters?.isActive !== undefined) {
      where.is_active = filters.isActive;
    }

    if (filters?.search) {
      where.OR = [
        { email: { contains: filters.search, mode: 'insensitive' } },
        { first_name: { contains: filters.search, mode: 'insensitive' } },
        { last_name: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const admins = await prisma.companyAdmin.findMany({
      where,
      orderBy: [
        { first_name: 'asc' }
      ]
    });

    // Remover passwords
    return admins.map(({ password, ...admin }) => admin);
  }

  /**
   * Obtener un admin por ID
   */
  async getCompanyAdminById(id: string) {
    const admin = await prisma.companyAdmin.findUnique({
      where: { id },
    });

    if (!admin) {
      return null;
    }

    const { password, ...adminWithoutPassword } = admin;
    return adminWithoutPassword;
  }

  /**
   * Actualizar un admin
   */
  async updateCompanyAdmin(id: string, data: UpdateCompanyAdminDto) {
    const admin = await this.getCompanyAdminById(id);
    
    if (!admin) {
      throw new Error('Administrador no encontrado');
    }

    const updated = await prisma.companyAdmin.update({
      where: { id },
      data: {
        first_name: data.firstName,
        last_name: data.lastName,
        can_create: data.canCreate,
        can_update: data.canUpdate,
        can_delete: data.canDelete,
        can_view_stats: data.canViewStats,
        can_manage_stock: data.canManageStock,
        is_active: data.isActive
      }
    });

    const { password, ...adminWithoutPassword } = updated;
    return adminWithoutPassword;
  }

  /**
   * Actualizar permisos de un admin
   */
  async updatePermissions(id: string, data: UpdatePermissionsDto) {
    const admin = await this.getCompanyAdminById(id);
    
    if (!admin) {
      throw new Error('Administrador no encontrado');
    }

    const updated = await prisma.companyAdmin.update({
      where: { id },
      data: {
        can_create: data.canCreate,
        can_update: data.canUpdate,
        can_delete: data.canDelete,
        can_view_stats: data.canViewStats,
        can_manage_stock: data.canManageStock
      }
    });

    const { password, ...adminWithoutPassword } = updated;
    return adminWithoutPassword;
  }

  /**
   * Reset password de un admin
   */
  async resetPassword(id: string, data: ResetPasswordDto) {
    const admin = await this.getCompanyAdminById(id);
    
    if (!admin) {
      throw new Error('Administrador no encontrado');
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    await prisma.companyAdmin.update({
      where: { id },
      data: { password: hashedPassword }
    });

    return { message: 'Contraseña actualizada exitosamente' };
  }

  /**
   * Eliminar un admin (soft delete)
   */
  async deleteCompanyAdmin(id: string) {
    const admin = await this.getCompanyAdminById(id);
    
    if (!admin) {
      throw new Error('Administrador no encontrado');
    }

    const updated = await prisma.companyAdmin.update({
      where: { id },
      data: { is_active: false }
    });

    const { password, ...adminWithoutPassword } = updated;
    return adminWithoutPassword;
  }

  /**
   * Obtener admins por compañía
   */
  async getAdminsByCompany(companyId: string) {
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      throw new Error('Compañía no encontrada');
    }

    const admins = await prisma.companyAdmin.findMany({
      where: { company_id: companyId },
      orderBy: [
        { is_active: 'desc' },
        { first_name: 'asc' }
      ]
    });

    return admins.map(({ password, ...admin }) => admin);
  }
}

export const companyAdminService = new CompanyAdminService();
