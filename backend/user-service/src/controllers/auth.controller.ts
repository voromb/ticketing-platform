import { Request, Response } from 'express';
import AuthService from '../services/auth.service';

class AuthController {
  constructor() {
    this.authService = new AuthService();
  }

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email/Usuario y contraseña son requeridos'
        });
      }

      // Permitir login con email o username
      const result = await this.authService.login(email, password);
      res.json(result);
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  };

  register = async (req: Request, res: Response) => {
    try {
      const result = await this.authService.register(req.body);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  getProfile = async (req: any, res: Response) => {
    try {
      const user = await this.authService.getUserById(req.user.id);
      res.json({
        success: true,
        user
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  updateProfile = async (req: any, res: Response) => {
    try {
      const result = await this.authService.updateProfile(req.user.id, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  changePassword = async (req: any, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Contraseña actual y nueva contraseña son requeridas'
        });
      }

      const result = await this.authService.changePassword(
        req.user.id, 
        currentPassword, 
        newPassword
      );
      res.json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  googleLogin = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Token de Google es requerido'
        });
      }

      const result = await this.authService.googleLogin(token);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };
}

export default AuthController;