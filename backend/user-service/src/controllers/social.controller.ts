import { Request, Response } from 'express';
import { EventLike, UserFollow, EventComment } from '../models/social.models';
import User from '../models/user.model';
import { 
  CreateLikeDTO, 
  LikeResponseDTO, 
  CreateFollowDTO, 
  FollowResponseDTO, 
  FollowStatsDTO,
  CreateCommentDTO, 
  UpdateCommentDTO, 
  CommentResponseDTO, 
  CommentDTO, 
  CommentQueryDTO, 
  CommentListResponseDTO,
  EventSocialStatsDTO,
  UserSocialStatsDTO
} from '../dto/social.dto';

class SocialController {
  
  // ==================== LIKE CONTROLLERS ====================
  
  /**
   * Dar like a un evento
   */
  likeEvent = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      const { eventId } = req.params;

      if (!userId) {
        res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        return;
      }

      if (!eventId) {
        res.status(400).json({ success: false, error: 'Event ID es requerido' });
        return;
      }

      // Verificar si ya existe el like
      const existingLike = await EventLike.findOne({ userId, eventId });
      
      if (existingLike) {
        // Quitar el like
        await EventLike.deleteOne({ userId, eventId });
        const totalLikes = await EventLike.countDocuments({ eventId });
        
        res.json({
          success: true,
          message: 'Like removido',
          isLiked: false,
          totalLikes
        } as LikeResponseDTO);
      } else {
        // Crear nuevo like
        await EventLike.create({ userId, eventId });
        const totalLikes = await EventLike.countDocuments({ eventId });
        
        res.json({
          success: true,
          message: 'Like agregado',
          isLiked: true,
          totalLikes
        } as LikeResponseDTO);
      }
    } catch (error: any) {
      console.error('Error liking event:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  };

  /**
   * Obtener estadísticas de likes de un evento
   */
  getEventLikes = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      const { eventId } = req.params;

      const totalLikes = await EventLike.countDocuments({ eventId });
      let isLikedByUser = false;

      if (userId) {
        const userLike = await EventLike.findOne({ userId, eventId });
        isLikedByUser = !!userLike;
      }

      res.json({
        success: true,
        totalLikes,
        isLikedByUser
      });
    } catch (error: any) {
      console.error('Error getting event likes:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  };

  // ==================== FOLLOW CONTROLLERS ====================

  /**
   * Seguir a un usuario
   */
  followUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const followerId = (req as any).user?.id;
      const { followingId } = req.body as CreateFollowDTO;

      if (!followerId) {
        res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        return;
      }

      if (!followingId) {
        res.status(400).json({ success: false, error: 'Following ID es requerido' });
        return;
      }

      if (followerId === followingId) {
        res.status(400).json({ success: false, error: 'No puedes seguirte a ti mismo' });
        return;
      }

      // Verificar que el usuario a seguir existe
      const userToFollow = await User.findById(followingId);
      if (!userToFollow) {
        res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        return;
      }

      // Verificar si ya existe el follow
      const existingFollow = await UserFollow.findOne({ followerId, followingId });
      
      if (existingFollow) {
        // Dejar de seguir
        await UserFollow.deleteOne({ followerId, followingId });
        
        res.json({
          success: true,
          message: 'Dejaste de seguir al usuario',
          isFollowing: false
        } as FollowResponseDTO);
      } else {
        // Crear nuevo follow
        await UserFollow.create({ followerId, followingId });
        
        res.json({
          success: true,
          message: 'Ahora sigues al usuario',
          isFollowing: true
        } as FollowResponseDTO);
      }
    } catch (error: any) {
      console.error('Error following user:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  };

  /**
   * Obtener estadísticas de follows de un usuario
   */
  getUserFollowStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const currentUserId = (req as any).user?.id;
      const { userId } = req.params;

      const followersCount = await UserFollow.countDocuments({ followingId: userId });
      const followingCount = await UserFollow.countDocuments({ followerId: userId });
      
      let isFollowing = false;
      if (currentUserId && currentUserId !== userId) {
        const follow = await UserFollow.findOne({ followerId: currentUserId, followingId: userId });
        isFollowing = !!follow;
      }

      res.json({
        success: true,
        followersCount,
        followingCount,
        isFollowing
      } as UserSocialStatsDTO);
    } catch (error: any) {
      console.error('Error getting user follow stats:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  };

  /**
   * Obtener lista de seguidores
   */
  getFollowers = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const pageNumber = Number(page) || 1;
      const pageSize = Number(limit) || 20;

      const followers = await UserFollow.find({ followingId: userId })
        .populate('followerId', 'username firstName lastName avatar')
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize);

      const totalFollowers = await UserFollow.countDocuments({ followingId: userId });

      res.json({
        success: true,
        followers: followers.map(f => f.followerId),
        total: totalFollowers,
        page: pageNumber,
        totalPages: Math.ceil(totalFollowers / pageSize)
      });
    } catch (error: any) {
      console.error('Error getting followers:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  };

  /**
   * Obtener lista de usuarios seguidos
   */
  getFollowing = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const pageNumber = Number(page) || 1;
      const pageSize = Number(limit) || 20;

      const following = await UserFollow.find({ followerId: userId })
        .populate('followingId', 'username firstName lastName avatar')
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize);

      const totalFollowing = await UserFollow.countDocuments({ followerId: userId });

      res.json({
        success: true,
        following: following.map(f => f.followingId),
        total: totalFollowing,
        page: pageNumber,
        totalPages: Math.ceil(totalFollowing / pageSize)
      });
    } catch (error: any) {
      console.error('Error getting following:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  };

  // ==================== COMMENT CONTROLLERS ====================

  /**
   * Crear comentario en un evento
   */
  createComment = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      const { eventId, content, parentCommentId } = req.body as CreateCommentDTO;

      if (!userId) {
        res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        return;
      }

      if (!eventId || !content) {
        res.status(400).json({ success: false, error: 'Event ID y contenido son requeridos' });
        return;
      }

      if (content.length > 1000) {
        res.status(400).json({ success: false, error: 'El comentario no puede exceder 1000 caracteres' });
        return;
      }

      // Si es una respuesta, verificar que el comentario padre existe
      if (parentCommentId) {
        const parentComment = await EventComment.findById(parentCommentId);
        if (!parentComment || parentComment.eventId !== eventId) {
          res.status(400).json({ success: false, error: 'Comentario padre no válido' });
          return;
        }
      }

      const comment = await EventComment.create({
        userId,
        eventId,
        content: content.trim(),
        parentCommentId: parentCommentId || undefined
      });

      // Populate user data
      await comment.populate('userId', 'username firstName lastName avatar');

      res.status(201).json({
        success: true,
        message: 'Comentario creado exitosamente',
        comment: this.formatComment(comment)
      } as CommentResponseDTO);
    } catch (error: any) {
      console.error('Error creating comment:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  };

  /**
   * Obtener comentarios de un evento
   */
  getEventComments = async (req: Request, res: Response): Promise<void> => {
    try {
      const { eventId } = req.params;
      const { page = 1, limit = 20, parentCommentId } = req.query as any;

      const pageNumber = Number(page) || 1;
      const pageSize = Number(limit) || 20;

      const query: any = { 
        eventId, 
        isDeleted: false,
        parentCommentId: parentCommentId || null
      };

      const comments = await EventComment.find(query)
        .populate('userId', 'username firstName lastName avatar')
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize);

      const totalComments = await EventComment.countDocuments(query);

      // Para comentarios principales, obtener respuestas
      const formattedComments = await Promise.all(
        comments.map(async (comment) => {
          const formatted = this.formatComment(comment);
          
          if (!parentCommentId) {
            // Obtener respuestas para comentarios principales
            const replies = await EventComment.find({
              parentCommentId: comment._id,
              isDeleted: false
            })
            .populate('userId', 'username firstName lastName avatar')
            .sort({ createdAt: 1 })
            .limit(5); // Máximo 5 respuestas por comentario

            formatted.replies = replies.map(reply => this.formatComment(reply));
            formatted.repliesCount = await EventComment.countDocuments({
              parentCommentId: comment._id,
              isDeleted: false
            });
          }

          return formatted;
        })
      );

      res.json({
        success: true,
        comments: formattedComments,
        total: totalComments,
        page: pageNumber,
        totalPages: Math.ceil(totalComments / pageSize)
      } as CommentListResponseDTO);
    } catch (error: any) {
      console.error('Error getting event comments:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  };

  /**
   * Actualizar comentario
   */
  updateComment = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      const { commentId } = req.params;
      const { content } = req.body as UpdateCommentDTO;

      if (!userId) {
        res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        return;
      }

      if (!content || content.length > 1000) {
        res.status(400).json({ success: false, error: 'Contenido inválido' });
        return;
      }

      const comment = await EventComment.findOne({ _id: commentId, userId, isDeleted: false });
      
      if (!comment) {
        res.status(404).json({ success: false, error: 'Comentario no encontrado' });
        return;
      }

      comment.content = content.trim();
      comment.isEdited = true;
      await comment.save();

      await comment.populate('userId', 'username firstName lastName avatar');

      res.json({
        success: true,
        message: 'Comentario actualizado exitosamente',
        comment: this.formatComment(comment)
      } as CommentResponseDTO);
    } catch (error: any) {
      console.error('Error updating comment:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  };

  /**
   * Eliminar comentario (soft delete)
   */
  deleteComment = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      const { commentId } = req.params;

      if (!userId) {
        res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        return;
      }

      const comment = await EventComment.findOne({ _id: commentId, userId, isDeleted: false });
      
      if (!comment) {
        res.status(404).json({ success: false, error: 'Comentario no encontrado' });
        return;
      }

      comment.isDeleted = true;
      comment.content = '[Comentario eliminado]';
      await comment.save();

      res.json({
        success: true,
        message: 'Comentario eliminado exitosamente'
      } as CommentResponseDTO);
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  };

  /**
   * Dar like a un comentario
   */
  likeComment = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      const { commentId } = req.params;

      if (!userId) {
        res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        return;
      }

      const comment = await EventComment.findById(commentId);
      
      if (!comment || comment.isDeleted) {
        res.status(404).json({ success: false, error: 'Comentario no encontrado' });
        return;
      }

      const likeIndex = comment.likes.indexOf(userId);
      
      if (likeIndex > -1) {
        // Quitar like
        comment.likes.splice(likeIndex, 1);
        await comment.save();
        
        res.json({
          success: true,
          message: 'Like removido',
          isLiked: false,
          likesCount: comment.likes.length
        });
      } else {
        // Agregar like
        comment.likes.push(userId);
        await comment.save();
        
        res.json({
          success: true,
          message: 'Like agregado',
          isLiked: true,
          likesCount: comment.likes.length
        });
      }
    } catch (error: any) {
      console.error('Error liking comment:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  };

  // ==================== HELPER METHODS ====================

  /**
   * Formatear comentario para respuesta
   */
  private formatComment(comment: any): CommentDTO {
    return {
      id: comment._id.toString(),
      userId: comment.userId._id?.toString() || comment.userId.toString(),
      eventId: comment.eventId,
      content: comment.content,
      parentCommentId: comment.parentCommentId?.toString(),
      isEdited: comment.isEdited,
      isDeleted: comment.isDeleted,
      likes: comment.likes || [],
      likesCount: comment.likes?.length || 0,
      repliesCount: 0, // Se llenará después si es necesario
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      user: comment.userId._id ? {
        id: comment.userId._id.toString(),
        username: comment.userId.username,
        avatar: comment.userId.avatar,
        firstName: comment.userId.firstName,
        lastName: comment.userId.lastName
      } : undefined,
      replies: []
    };
  }
}

export default new SocialController();
