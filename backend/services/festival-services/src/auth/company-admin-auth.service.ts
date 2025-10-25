import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { CompanyAdminLoginDto } from './dto/company-admin-auth.dto';

export interface CompanyAdminPayload {
  id: string;
  email: string;
  companyId: string;
  companyName: string;
  companyType: string;
  companyRegion: string;
  permissions: {
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    canViewStats: boolean;
    canManageStock: boolean;
  };
}

@Injectable()
export class CompanyAdminAuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Login de COMPANY_ADMIN
   */
  async login(loginDto: CompanyAdminLoginDto) {
    const { email, password } = loginDto;

    // Buscar admin en PostgreSQL
    const admin = await this.prisma.companyAdmin.findUnique({
      where: { email },
      include: {
        companies: true,
      },
    });

    if (!admin) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar que el admin esté activo
    if (!admin.is_active) {
      throw new UnauthorizedException('Cuenta desactivada');
    }

    // Verificar que la compañía esté activa
    if (!admin.companies.is_active) {
      throw new UnauthorizedException('Compañía desactivada');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Actualizar last_login
    await this.prisma.companyAdmin.update({
      where: { id: admin.id },
      data: { last_login: new Date() },
    });

    // Crear payload JWT
    const payload: CompanyAdminPayload = {
      id: admin.id,
      email: admin.email,
      companyId: admin.company_id,
      companyName: admin.companies.name,
      companyType: admin.companies.type,
      companyRegion: admin.companies.region,
      permissions: {
        canCreate: admin.can_create ?? false,
        canUpdate: admin.can_update ?? false,
        canDelete: admin.can_delete ?? false,
        canViewStats: admin.can_view_stats ?? false,
        canManageStock: admin.can_manage_stock ?? false,
      },
    };

    const access_token = this.jwtService.sign(payload);

    console.log(
      `[COMPANY_ADMIN] ${admin.email} de ${admin.companies.name} ha iniciado sesión`,
    );

    return {
      access_token,
      user: {
        id: admin.id,
        email: admin.email,
        firstName: admin.first_name,
        lastName: admin.last_name,
        company: {
          id: admin.companies.id,
          name: admin.companies.name,
          type: admin.companies.type,
          region: admin.companies.region,
        },
        permissions: payload.permissions,
      },
    };
  }

  /**
   * Validar token y obtener datos del admin
   */
  async validateCompanyAdmin(payload: CompanyAdminPayload) {
    const admin = await this.prisma.companyAdmin.findUnique({
      where: { id: payload.id },
      include: {
        companies: true,
      },
    });

    if (!admin || !admin.is_active || !admin.companies.is_active) {
      return null;
    }

    return {
      id: admin.id,
      email: admin.email,
      companyId: admin.company_id,
      companyName: admin.companies.name,
      companyType: admin.companies.type,
      companyRegion: admin.companies.region,
      permissions: {
        canCreate: admin.can_create ?? false,
        canUpdate: admin.can_update ?? false,
        canDelete: admin.can_delete ?? false,
        canViewStats: admin.can_view_stats ?? false,
        canManageStock: admin.can_manage_stock ?? false,
      },
    };
  }

  /**
   * Obtener perfil del admin
   */
  async getProfile(adminId: string) {
    const admin = await this.prisma.companyAdmin.findUnique({
      where: { id: adminId },
      include: {
        companies: true,
      },
    });

    if (!admin) {
      throw new UnauthorizedException('Administrador no encontrado');
    }

    // No devolver password
    const { password, ...adminWithoutPassword } = admin;
    return adminWithoutPassword;
  }
}
