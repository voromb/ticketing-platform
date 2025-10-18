// ==================== LIKE DTOs ====================
export interface CreateLikeDTO {
  eventId: string;
}

export interface LikeResponseDTO {
  success: boolean;
  message: string;
  isLiked: boolean;
  totalLikes: number;
}

// ==================== FOLLOW DTOs ====================
export interface CreateFollowDTO {
  followingId: string; // ID del usuario a seguir
}

export interface FollowResponseDTO {
  success: boolean;
  message: string;
  isFollowing: boolean;
}

export interface FollowStatsDTO {
  followersCount: number;
  followingCount: number;
}

// ==================== COMMENT DTOs ====================
export interface CreateCommentDTO {
  eventId: string;
  content: string;
  parentCommentId?: string; // Para respuestas
}

export interface UpdateCommentDTO {
  content: string;
}

export interface CommentResponseDTO {
  success: boolean;
  message: string;
  comment?: CommentDTO;
}

export interface CommentDTO {
  id: string;
  userId: string;
  eventId: string;
  content: string;
  parentCommentId?: string;
  isEdited: boolean;
  isDeleted: boolean;
  likes: string[];
  likesCount: number;
  repliesCount: number;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    username: string;
    avatar?: string;
    firstName?: string;
    lastName?: string;
  };
  replies?: CommentDTO[];
}

export interface CommentQueryDTO {
  eventId: string;
  page?: number;
  limit?: number;
  parentCommentId?: string; // Para obtener respuestas específicas
}

export interface CommentListResponseDTO {
  success: boolean;
  comments: CommentDTO[];
  total: number;
  page: number;
  totalPages: number;
}

// ==================== SOCIAL STATS DTOs ====================
export interface EventSocialStatsDTO {
  eventId: string;
  likesCount: number;
  commentsCount: number;
  isLikedByUser: boolean;
}

export interface UserSocialStatsDTO {
  userId: string;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
}
