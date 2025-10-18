import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CompanyAdminAuthService } from './company-admin-auth.service';
import { CompanyAdminLoginDto } from './dto/company-admin-auth.dto';
import { CompanyAdminGuard } from './guards/company-admin.guard';
import { CurrentCompanyAdmin } from './decorators/current-company-admin.decorator';

@ApiTags('Company Admin Auth')
@Controller('auth/company-admin')
export class CompanyAdminAuthController {
  constructor(private companyAdminAuthService: CompanyAdminAuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login de administrador de compañía' })
  @ApiResponse({ status: 200, description: 'Login exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Body() loginDto: CompanyAdminLoginDto) {
    return this.companyAdminAuthService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(CompanyAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil del administrador' })
  @ApiResponse({ status: 200, description: 'Perfil obtenido' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getProfile(@CurrentCompanyAdmin() admin: any) {
    return this.companyAdminAuthService.getProfile(admin.id);
  }
}
