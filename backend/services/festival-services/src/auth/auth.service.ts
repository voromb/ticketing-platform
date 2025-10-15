import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { LoginDto, RegisterDto, AuthResponseDto } from './dto/auth.dto';
import { User, UserRole, JwtPayload } from './interfaces/user.interface';

@Injectable()
export class AuthService {
  // Simulamos una base de datos en memoria para usuarios
  // En producción esto sería una base de datos real
  private users: User[] = [
    {
      id: 'admin-1',
      email: 'admin@festival.com',
      role: UserRole.ADMIN,
      name: 'Administrador Festival',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'mod-1',
      email: 'moderator@festival.com',
      role: UserRole.MODERATOR,
      name: 'Moderador Festival',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'user-1',
      email: 'user@festival.com',
      role: UserRole.USER,
      name: 'Usuario Festival',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  // Passwords hasheadas para los usuarios por defecto
  private passwords: Record<string, string> = {
    'admin@festival.com':
      '$2b$10$sdvY64hFdIFbs/xS4mKHYu6lE7bRRb0voLbDhWG2AkFPV.r3/Zf2C', // password
    'moderator@festival.com':
      '$2b$10$sdvY64hFdIFbs/xS4mKHYu6lE7bRRb0voLbDhWG2AkFPV.r3/Zf2C', // password
    'user@festival.com':
      '$2b$10$sdvY64hFdIFbs/xS4mKHYu6lE7bRRb0voLbDhWG2AkFPV.r3/Zf2C', // password
  };

  constructor(private jwtService: JwtService) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Buscar usuario
    const user = this.users.find((u) => u.email === email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar contraseña
    const storedPassword = this.passwords[email];
    if (!storedPassword || !(await bcrypt.compare(password, storedPassword))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar JWT
    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload);

    console.log(`🔐 Usuario ${user.email} (${user.role}) ha iniciado sesión`);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name || '',
      },
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, name, role = UserRole.USER } = registerDto;

    // Verificar si el usuario ya existe
    const existingUser = this.users.find((u) => u.email === email);
    if (existingUser) {
      throw new ConflictException('El usuario ya existe');
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear nuevo usuario
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      role,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Guardar usuario y contraseña
    this.users.push(newUser);
    this.passwords[email] = hashedPassword;

    // Generar JWT
    const payload: JwtPayload = {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    };

    const access_token = this.jwtService.sign(payload);

    console.log(
      `[AUTH] Nuevo usuario registrado: ${newUser.email} (${newUser.role})`,
    );

    return {
      access_token,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name || '',
      },
    };
  }

  async validateUser(payload: JwtPayload): Promise<User | null> {
    const user = this.users.find(
      (u) => u.id === payload.id && u.email === payload.email,
    );
    return user || null;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.find((u) => u.id === id) || null;
  }

  async getAllUsers(): Promise<User[]> {
    return this.users.map((user) => ({
      ...user,
      // No devolver información sensible
    }));
  }
}
