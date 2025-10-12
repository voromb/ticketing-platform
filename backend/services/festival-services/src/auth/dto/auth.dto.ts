import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../interfaces/user.interface';

export class LoginDto {
  @ApiProperty({ 
    description: 'Email del usuario',
    example: 'admin@festival.com'
  })
  @IsEmail()
  email: string;

  @ApiProperty({ 
    description: 'Contraseña del usuario',
    example: 'password123'
  })
  @IsString()
  @MinLength(6)
  password: string;
}

export class RegisterDto {
  @ApiProperty({ 
    description: 'Email del usuario',
    example: 'user@festival.com'
  })
  @IsEmail()
  email: string;

  @ApiProperty({ 
    description: 'Contraseña del usuario (mínimo 6 caracteres)',
    example: 'password123'
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ 
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez'
  })
  @IsString()
  name: string;

  @ApiProperty({ 
    description: 'Rol del usuario',
    enum: UserRole,
    example: UserRole.USER,
    required: false
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

export class AuthResponseDto {
  @ApiProperty({ 
    description: 'Token JWT de acceso',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  access_token: string;

  @ApiProperty({ 
    description: 'Información del usuario',
    example: {
      id: 'user-123',
      email: 'user@festival.com',
      role: 'USER',
      name: 'Juan Pérez'
    }
  })
  user: {
    id: string;
    email: string;
    role: UserRole;
    name: string;
  };
}
