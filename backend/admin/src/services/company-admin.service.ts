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

    if (!company.isActive) {
      throw new Error('No se puede crear un administrador para una compañía inactiva');
    }

    // Hash del password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const admin = await prisma.companyAdmin.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        companyId: data.companyId,
        canCreate: data.canCreate ?? true,
        canUpdate: data.canUpdate ?? true,
        canDelete: data.canDelete ?? false,
        canViewStats: data.canViewStats ?? true,
        canManageStock: data.canManageStock ?? true
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            type: true,
            region: true
          }
        }
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
      where.companyId = filters.companyId;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.search) {
      where.OR = [
        { email: { contains: filters.search, mode: 'insensitive' } },
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const admins = await prisma.companyAdmin.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            type: true,
            region: true,
            isActive: true
          }
        }
      },
      orderBy: [
        { company: { name: 'asc' } },
        { firstName: 'asc' }
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
      include: {
        company: {
          select: {
            id: true,
            name: true,
            type: true,
            region: true,
            isActive: true,
            contactEmail: true,
            contactPhone: true
          }
        }
      }
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
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        canCreate: data.canCreate,
        canUpdate: data.canUpdate,
        canDelete: data.canDelete,
        canViewStats: data.canViewStats,
        canManageStock: data.canManageStock,
        isActive: data.isActive
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            type: true,
            region: true
          }
        }
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
        canCreate: data.canCreate,
        canUpdate: data.canUpdate,
        canDelete: data.canDelete,
        canViewStats: data.canViewStats,
        canManageStock: data.canManageStock
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
      data: { isActive: false }
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
      where: { companyId },
      orderBy: [
        { isActive: 'desc' },
        { firstName: 'asc' }
      ]
    });

    return admins.map(({ password, ...admin }) => admin);
  }
}

export const companyAdminService = new CompanyAdminService();
