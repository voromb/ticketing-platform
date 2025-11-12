import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// Interfaces
export interface Message {
  _id?: string;
  conversationId: string;
  senderId: string;
  senderType: 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'USER' | 'SYSTEM';
  senderName: string;
  recipientId: string;
  recipientType: 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'USER';
  recipientName: string;
  content: string;
  isRead: boolean;
  metadata?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Conversation {
  _id?: string;
  id?: string;
  conversationId?: string; // El backend devuelve este campo
  participants: Array<{
    userId: string;
    userType: string;
    userName: string;
  }>;
  lastMessage?: {
    content: string;
    senderId: string;
    senderName: string;
    createdAt: Date;
  };
  unreadCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Notification {
  _id?: string;
  userId: string;
  userType: 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'USER';
  title: string;
  message: string;
  notificationType: 'SUCCESS' | 'INFO' | 'WARNING' | 'ERROR';
  category: 'PURCHASE' | 'APPROVAL' | 'SYSTEM' | 'GENERAL';
  isRead: boolean;
  metadata?: any;
  expiresAt?: Date;
  createdAt?: Date;
}

export interface SendMessageDto {
  recipientId: string;
  recipientType: 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'USER';
  recipientName?: string;
  content: string;
  subject?: string;
  messageType?: string;
  metadata?: any;
}

export interface CreateNotificationDto {
  userId: string;
  userType: 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'USER';
  title: string;
  message: string;
  notificationType: 'SUCCESS' | 'INFO' | 'WARNING' | 'ERROR';
  category: 'PURCHASE' | 'APPROVAL' | 'SYSTEM' | 'GENERAL';
  metadata?: any;
  expiresAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class MessagingService {
  private apiUrl = environment.messagingApiUrl;
  
  // BehaviorSubjects para notificaciones en tiempo real
  private unreadMessagesCount$ = new BehaviorSubject<number>(0);
  private unreadNotificationsCount$ = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient) {
    // Cargar contadores al iniciar
    this.loadUnreadCounts();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    const userType = localStorage.getItem('userType');
    
    const headers: any = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    // Agregar datos del usuario en headers personalizados (workaround hasta implementar JWT en backend)
    if (userId) headers['X-User-Id'] = userId;
    if (userName) headers['X-User-Name'] = userName;
    if (userType) headers['X-User-Type'] = userType;
    
    return new HttpHeaders(headers);
  }

  // Observables públicos para los contadores
  getUnreadMessagesCount(): Observable<number> {
    return this.unreadMessagesCount$.asObservable();
  }

  getUnreadNotificationsCount(): Observable<number> {
    return this.unreadNotificationsCount$.asObservable();
  }

  // Cargar contadores
  private loadUnreadCounts(): void {
    // Cargar contador de mensajes no leídos
    this.getConversations().subscribe({
      next: (response) => {
        const totalUnread = response.reduce((sum: number, conv: Conversation) => sum + conv.unreadCount, 0);
        this.unreadMessagesCount$.next(totalUnread);
      },
      error: () => {
        this.unreadMessagesCount$.next(0);
      }
    });

    // Cargar contador de notificaciones no leídas
    this.getUnreadNotificationsCountApi().subscribe({
      next: (response) => {
        this.unreadNotificationsCount$.next(response.count || 0);
      },
      error: () => {
        this.unreadNotificationsCount$.next(0);
      }
    });
  }

  // ==================== MENSAJES ====================

  // Enviar mensaje
  sendMessage(messageDto: SendMessageDto): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/messages/send`, messageDto, { headers: this.getHeaders() })
      .pipe(tap(() => this.loadUnreadCounts()));
  }

  // Obtener conversaciones
  getConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.apiUrl}/messages/conversations`, { headers: this.getHeaders() });
  }

  // Obtener mensajes de una conversación
  getConversationMessages(conversationId: string, page: number = 1, limit: number = 20): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/messages/conversations/${conversationId}?page=${page}&limit=${limit}`,
      { headers: this.getHeaders() }
    );
  }

  // Marcar mensaje como leído
  markMessageAsRead(messageId: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/messages/${messageId}/read`, {}, { headers: this.getHeaders() })
      .pipe(tap(() => this.loadUnreadCounts()));
  }

  // Marcar todos los mensajes de una conversación como leídos
  markConversationAsRead(conversationId: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/messages/conversations/${conversationId}/read-all`, {}, { headers: this.getHeaders() })
      .pipe(tap(() => this.loadUnreadCounts()));
  }

  // Eliminar conversación
  deleteConversation(conversationId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/messages/conversations/${conversationId}`, { headers: this.getHeaders() })
      .pipe(tap(() => this.loadUnreadCounts()));
  }

  // ==================== NOTIFICACIONES ====================

  // Crear notificación
  createNotification(notificationDto: CreateNotificationDto): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/notifications`, notificationDto, { headers: this.getHeaders() })
      .pipe(tap(() => this.loadUnreadCounts()));
  }

  // Obtener notificaciones
  getNotifications(page: number = 1, limit: number = 20, category?: string): Observable<any> {
    let url = `${this.apiUrl}/notifications?page=${page}&limit=${limit}`;
    if (category) url += `&category=${category}`;
    return this.http.get<any>(url, { headers: this.getHeaders() });
  }

  // Obtener contador de notificaciones no leídas
  getUnreadNotificationsCountApi(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/notifications/unread-count`, { headers: this.getHeaders() });
  }

  // Marcar notificación como leída
  markNotificationAsRead(notificationId: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/notifications/${notificationId}/read`, {}, { headers: this.getHeaders() })
      .pipe(tap(() => this.loadUnreadCounts()));
  }

  // Marcar todas las notificaciones como leídas
  markAllNotificationsAsRead(): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/notifications/mark-all-read`, {}, { headers: this.getHeaders() })
      .pipe(tap(() => this.loadUnreadCounts()));
  }

  // Eliminar notificación
  deleteNotification(notificationId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/notifications/${notificationId}`, { headers: this.getHeaders() })
      .pipe(tap(() => this.loadUnreadCounts()));
  }

  // Refrescar contadores manualmente
  refreshUnreadCounts(): void {
    console.log('🔄 Recargando contadores de mensajes y notificaciones...');
    this.loadUnreadCounts();
  }

  // ==================== OBTENER USUARIOS/ADMINS ====================
  
  // Obtener lista de usuarios según tipo
  getUsersByType(userType: string): Observable<any[]> {
    if (userType === 'USER') {
      // Llamar a la API de usuarios (puerto 3001) - SIN autenticación requerida
      return this.http.get<any>(`${environment.userApiUrl}/users`)
        .pipe(
          map(response => {
            // Si la respuesta es un objeto con propiedad 'users' o 'data', extraer el array
            if (response && typeof response === 'object') {
              return response.users || response.data || response || [];
            }
            return Array.isArray(response) ? response : [];
          })
        );
    } else if (userType === 'SUPER_ADMIN') {
      // Llamar al nuevo endpoint público para admins (puerto 3003) - SIN autenticación requerida
      return this.http.get<any[]>(`${environment.apiUrl}/messaging-users/admins`);
    } else if (userType === 'COMPANY_ADMIN') {
      // Llamar al nuevo endpoint público para company admins (puerto 3003) - SIN autenticación requerida
      return this.http.get<any[]>(`${environment.apiUrl}/messaging-users/company-admins`);
    }
    
    // Fallback: retornar array vacío
    return new Observable(observer => {
      observer.next([]);
      observer.complete();
    });
  }
}
