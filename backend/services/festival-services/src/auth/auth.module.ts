import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

// Importaciones locales
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { CompanyAdminAuthService } from './company-admin-auth.service';
import { CompanyAdminAuthController } from './company-admin-auth.controller';
import { CompanyAdminGuard } from './guards/company-admin.guard';
import { CompanyPermissionGuard } from './guards/company-permission.guard';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'festival-secret-key-2024',
      signOptions: {
        expiresIn: '1d',
      },
    }),
    PrismaModule,
  ],
  controllers: [AuthController, CompanyAdminAuthController],
  providers: [
    AuthService, 
    JwtStrategy, 
    CompanyAdminAuthService,
    CompanyAdminGuard,
    CompanyPermissionGuard,
  ],
  exports: [
    AuthService, 
    JwtStrategy, 
    PassportModule,
    JwtModule, // Exportar JwtModule para que esté disponible en otros módulos
    CompanyAdminAuthService,
    CompanyAdminGuard,
    CompanyPermissionGuard,
  ],
})
export class AuthModule {}
