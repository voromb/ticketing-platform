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
        company: {
          select: {
            id: true,
            name: true,
            type: true,
            region: true,
            isActive: true,
          },
        },
      },
    });

    if (!admin) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar que el admin esté activo
    if (!admin.isActive) {
      throw new UnauthorizedException('Cuenta desactivada');
    }

    // Verificar que la compañía esté activa
    if (!admin.company.isActive) {
      throw new UnauthorizedException('Compañía desactivada');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Actualizar lastLogin
    await this.prisma.companyAdmin.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() },
    });

    // Crear payload JWT
    const payload: CompanyAdminPayload = {
      id: admin.id,
      email: admin.email,
      companyId: admin.companyId,
      companyName: admin.company.name,
      companyType: admin.company.type,
      companyRegion: admin.company.region,
      permissions: {
        canCreate: admin.canCreate,
        canUpdate: admin.canUpdate,
        canDelete: admin.canDelete,
        canViewStats: admin.canViewStats,
        canManageStock: admin.canManageStock,
      },
    };

    const access_token = this.jwtService.sign(payload);

    console.log(
      `[COMPANY_ADMIN] ${admin.email} de ${admin.company.name} ha iniciado sesión`,
    );

    return {
      access_token,
      user: {
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        company: {
          id: admin.company.id,
          name: admin.company.name,
          type: admin.company.type,
          region: admin.company.region,
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
        company: {
          select: {
            id: true,
            name: true,
            type: true,
            region: true,
            isActive: true,
          },
        },
      },
    });

    if (!admin || !admin.isActive || !admin.company.isActive) {
      return null;
    }

    return {
      id: admin.id,
      email: admin.email,
      companyId: admin.companyId,
      companyName: admin.company.name,
      companyType: admin.company.type,
      companyRegion: admin.company.region,
      permissions: {
        canCreate: admin.canCreate,
        canUpdate: admin.canUpdate,
        canDelete: admin.canDelete,
        canViewStats: admin.canViewStats,
        canManageStock: admin.canManageStock,
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
        company: {
          select: {
            id: true,
            name: true,
            type: true,
            region: true,
            contactEmail: true,
            contactPhone: true,
          },
        },
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
