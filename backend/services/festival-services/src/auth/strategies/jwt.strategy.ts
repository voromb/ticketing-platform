import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload, User } from '../interfaces/user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'festival-secret-key-2024',
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const { id, email, role } = payload;
    
    // Validar que el payload tenga los campos requeridos
    if (!id || !email || !role) {
      throw new UnauthorizedException('Token inválido - payload incompleto');
    }
    
    // En una implementación real, aquí validarías contra la base de datos
    // Por ahora, confiamos en el payload del JWT
    const user: User = {
      id,
      email,
      role,
    };

    return user;
  }
}
