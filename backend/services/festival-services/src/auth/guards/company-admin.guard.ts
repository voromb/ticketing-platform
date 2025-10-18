import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CompanyAdminAuthService, CompanyAdminPayload } from '../company-admin-auth.service';

@Injectable()
export class CompanyAdminGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private companyAdminAuthService: CompanyAdminAuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    try {
      const payload = this.jwtService.verify<CompanyAdminPayload>(token);
      
      // Validar que el admin existe y está activo
      const admin = await this.companyAdminAuthService.validateCompanyAdmin(payload);
      
      if (!admin) {
        throw new UnauthorizedException('Administrador no válido o inactivo');
      }

      // Agregar datos del admin al request
      request.companyAdmin = admin;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
