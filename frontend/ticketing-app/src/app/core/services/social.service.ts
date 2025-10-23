import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LikeResponse {
  success: boolean;
  message: string;
  isLiked: boolean;
  totalLikes: number;
}

export interface FollowResponse {
  success: boolean;
  message: string;
  isFollowing: boolean;
}

export interface FollowStats {
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
}

export interface Comment {
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
  replies?: Comment[];
}

export interface CommentResponse {
  success: boolean;
  message: string;
  comment?: Comment;
}

export interface CommentListResponse {
  success: boolean;
  comments: Comment[];
  total: number;
  page: number;
  totalPages: number;
}

export interface EventSocialStats {
  eventId: string;
  likesCount: number;
  commentsCount: number;
  isLikedByUser: boolean;
}

export interface LikedEvent {
  id: string;
  name: string;
  description: string;
  slug: string;
  eventDate: string;
  bannerImage?: string;
  thumbnailImage?: string;
  venue: {
    id: string;
    name: string;
    city: string;
    country: string;
  };
  category: {
    id: number;
    name: string;
  };
  likedAt: string;
  isDeleted?: boolean; // Flag para eventos eliminados
}

export interface LikedEventsResponse {
  success: boolean;
  events: LikedEvent[];
  total: number;
  page: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class SocialService {
  private apiUrl = environment.userApiUrl + '/social';

  constructor(private http: HttpClient) {}

  // ==================== LIKE METHODS ====================

  /**
   * Dar like a un evento
   */
  likeEvent(eventId: string): Observable<LikeResponse> {
    return this.http.post<LikeResponse>(`${this.apiUrl}/events/${eventId}/like`, {});
  }

  /**
   * Obtener estadísticas de likes de un evento
   */
  getEventLikes(eventId: string): Observable<{ success: boolean; totalLikes: number; isLikedByUser: boolean }> {
    return this.http.get<{ success: boolean; totalLikes: number; isLikedByUser: boolean }>(`${this.apiUrl}/events/${eventId}/likes`);
  }

  /**
   * Obtener eventos que el usuario ha dado like
   */
  getUserLikedEvents(page: number = 1, limit: number = 20): Observable<LikedEventsResponse> {
    return this.http.get<LikedEventsResponse>(`${this.apiUrl}/user/liked-events`, {
      params: { page: page.toString(), limit: limit.toString() }
    });
  }

  // ==================== FOLLOW METHODS ====================

  /**
   * Seguir a un usuario
   */
  followUser(followingId: string): Observable<FollowResponse> {
    return this.http.post<FollowResponse>(`${this.apiUrl}/users/follow`, { followingId });
  }

  /**
   * Obtener estadísticas de follows de un usuario
   */
  getUserFollowStats(userId: string): Observable<FollowStats> {
    return this.http.get<FollowStats>(`${this.apiUrl}/users/${userId}/follow-stats`);
  }

  /**
   * Obtener lista de seguidores
   */
  getFollowers(userId: string, page: number = 1, limit: number = 20): Observable<CommentListResponse> {
    return this.http.get<CommentListResponse>(`${this.apiUrl}/users/${userId}/followers`, {
      params: { page: page.toString(), limit: limit.toString() }
    });
  }

  /**
   * Obtener lista de usuarios seguidos
   */
  getFollowing(userId: string, page: number = 1, limit: number = 20): Observable<CommentListResponse> {
    return this.http.get<CommentListResponse>(`${this.apiUrl}/users/${userId}/following`, {
      params: { page: page.toString(), limit: limit.toString() }
    });
  }

  // ==================== COMMENT METHODS ====================

  /**
   * Crear comentario en un evento
   */
  createComment(eventId: string, content: string, parentCommentId?: string): Observable<CommentResponse> {
    return this.http.post<CommentResponse>(`${this.apiUrl}/events/comments`, {
      eventId,
      content,
      parentCommentId
    });
  }

  /**
   * Obtener comentarios de un evento
   */
  getEventComments(eventId: string, page: number = 1, limit: number = 20, parentCommentId?: string): Observable<CommentListResponse> {
    let params: any = { page: page.toString(), limit: limit.toString() };
    if (parentCommentId) {
      params.parentCommentId = parentCommentId;
    }
    
    return this.http.get<CommentListResponse>(`${this.apiUrl}/events/${eventId}/comments`, { params });
  }

  /**
   * Actualizar comentario
   */
  updateComment(commentId: string, content: string): Observable<CommentResponse> {
    return this.http.put<CommentResponse>(`${this.apiUrl}/comments/${commentId}`, { content });
  }

  /**
   * Eliminar comentario
   */
  deleteComment(commentId: string): Observable<CommentResponse> {
    return this.http.delete<CommentResponse>(`${this.apiUrl}/comments/${commentId}`);
  }

  /**
   * Dar like a un comentario
   */
  likeComment(commentId: string): Observable<{ success: boolean; message: string; isLiked: boolean; likesCount: number }> {
    return this.http.post<{ success: boolean; message: string; isLiked: boolean; likesCount: number }>(`${this.apiUrl}/comments/${commentId}/like`, {});
  }
}
