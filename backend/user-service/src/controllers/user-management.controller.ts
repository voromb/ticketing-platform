import { Request, Response } from "express";
import User from "../models/user.model";

class UserManagementController {
  /**
   * Obtener todos los usuarios (para admin-service)
   */
  getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('[User Service] Admin consultando todos los usuarios');

      const users = await User.find({}, {
        password: 0 // Excluir contraseña por seguridad
      }).sort({ createdAt: -1 });

      res.json({
        success: true,
        users,
        total: users.length
      });
    } catch (error: any) {
      console.error('[User Service] Error obteniendo usuarios:', error.message);
      res.status(500).json({
        success: false,
        error: 'Error obteniendo usuarios',
        details: error.message
      });
    }
  };

  /**
   * Obtener un usuario por ID (para admin-service)
   */
  getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      console.log(`[User Service] Admin consultando usuario ${id}`);

      const user = await User.findById(id, {
        password: 0 // Excluir contraseña por seguridad
      });

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'Usuario no encontrado'
        });
        return;
      }

      res.json({
        success: true,
        user
      });
    } catch (error: any) {
      console.error(`[User Service] Error obteniendo usuario ${req.params.id}:`, error.message);
      res.status(500).json({
        success: false,
        error: 'Error obteniendo usuario',
        details: error.message
      });
    }
  };

  /**
   * Obtener un usuario CON contraseña (solo para promoción a COMPANY_ADMIN)
   */
  getUserWithPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      console.log(`[User Service] Admin solicitando usuario ${id} CON contraseña para promoción`);

      const user = await User.findById(id); // Incluir contraseña

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'Usuario no encontrado'
        });
        return;
      }

      res.json({
        success: true,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          password: user.password, // INCLUIR contraseña hasheada
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      });
    } catch (error: any) {
      console.error(`[User Service] Error obteniendo usuario con contraseña ${req.params.id}:`, error.message);
      res.status(500).json({
        success: false,
        error: 'Error obteniendo usuario',
        details: error.message
      });
    }
  };

  /**
   * Promocionar usuario a VIP (desde admin-service)
   */
  promoteUserToVip = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { promotedBy, newRole } = req.body;

      console.log(`[User Service] Promocionando usuario ${id} a VIP por admin ${promotedBy}`);

      // Verificar que el usuario existe
      const user = await User.findById(id);
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'Usuario no encontrado'
        });
        return;
      }

      // Verificar que no sea ya VIP
      if (user.role === 'vip') {
        res.status(400).json({
          success: false,
          error: 'El usuario ya es VIP'
        });
        return;
      }

      // Promocionar a VIP
      user.role = 'vip';
      await user.save();

      console.log(`[User Service] Usuario ${id} promocionado a VIP exitosamente`);

      // Devolver usuario sin contraseña
      const updatedUser = await User.findById(id, { password: 0 });

      res.json({
        success: true,
        message: 'Usuario promocionado a VIP exitosamente',
        user: updatedUser,
        promotedBy,
        timestamp: new Date()
      });
    } catch (error: any) {
      console.error(`[User Service] Error promocionando usuario ${req.params.id}:`, error.message);
      res.status(500).json({
        success: false,
        error: 'Error promocionando usuario a VIP',
        details: error.message
      });
    }
  };

  /**
   * Degradar usuario VIP a normal (desde admin-service)
   */
  demoteVipToUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { demotedBy, newRole } = req.body;

      console.log(`[User Service] Degradando usuario VIP ${id} a normal por admin ${demotedBy}`);

      // Verificar que el usuario existe
      const user = await User.findById(id);
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'Usuario no encontrado'
        });
        return;
      }

      // Verificar que sea VIP
      if (user.role !== 'vip') {
        res.status(400).json({
          success: false,
          error: 'El usuario no es VIP'
        });
        return;
      }

      // Degradar a usuario normal
      user.role = 'user';
      await user.save();

      console.log(`[User Service] Usuario VIP ${id} degradado a normal exitosamente`);

      // Devolver usuario sin contraseña
      const updatedUser = await User.findById(id, { password: 0 });

      res.json({
        success: true,
        message: 'Usuario VIP degradado a normal exitosamente',
        user: updatedUser,
        demotedBy,
        timestamp: new Date()
      });
    } catch (error: any) {
      console.error(`[User Service] Error degradando usuario VIP ${req.params.id}:`, error.message);
      res.status(500).json({
        success: false,
        error: 'Error degradando usuario VIP',
        details: error.message
      });
    }
  };

  /**
   * Obtener perfil del usuario autenticado
   */
  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Usuario no autenticado'
        });
        return;
      }

      const user = await User.findById(userId, {
        password: 0 // Excluir contraseña
      });

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'Usuario no encontrado'
        });
        return;
      }

      res.json({
        success: true,
        user: user
      });
    } catch (error: any) {
      console.error('[User Service] Error obteniendo perfil:', error.message);
      res.status(500).json({
        success: false,
        error: 'Error obteniendo perfil',
        details: error.message
      });
    }
  };

  /**
   * Actualizar perfil de usuario
   */
  updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      const { username, firstName, lastName, phone, address, city, country, dateOfBirth } = req.body;

      console.log(`[User Service] Actualizando perfil del usuario ${userId}`);
      console.log('Datos recibidos:', req.body);

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Usuario no autenticado'
        });
        return;
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          username,
          firstName,
          lastName,
          phone,
          address,
          city,
          country,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined
        },
        { 
          new: true,
          select: '-password' // Excluir contraseña
        }
      );

      if (!updatedUser) {
        res.status(404).json({
          success: false,
          error: 'Usuario no encontrado'
        });
        return;
      }

      console.log(`[User Service] Perfil actualizado exitosamente para usuario ${userId}`);

      res.json({
        success: true,
        message: 'Perfil actualizado correctamente',
        user: updatedUser
      });
    } catch (error: any) {
      console.error('[User Service] Error actualizando perfil:', error.message);
      res.status(500).json({
        success: false,
        error: 'Error actualizando perfil',
        details: error.message
      });
    }
  };
}

export default UserManagementController;
