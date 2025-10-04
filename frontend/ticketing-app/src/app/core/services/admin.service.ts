import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Event {
  id: string;
  name: string;
  description: string;
  eventDate: string;
  status: 'DRAFT' | 'ACTIVE' | 'CANCELLED' | 'COMPLETED';
  venue?: {
    id: string;
    name: string;
    city: string;
  };
  ticketsAvailable: number;
  ticketPrice: number;
  publishedAt?: string;
  isPublished?: boolean;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  capacity: number;
  isActive: boolean;
  country?: string;
  postalCode?: string;
  amenities?: string[];
  images?: string[];
  _count?: {
    events: number;
  };
  eventCount?: number;
  eventStatus?: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'vip';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  byRole: {
    user: number;
    vip: number;
  };
  recentUsers: User[];
}

export interface Category {
  id: number;
  name: string;
  subcategories?: Subcategory[];
  _count?: {
    events: number;
    subcategories: number;
  };
}

export interface Subcategory {
  id: number;
  categoryId: number;
  name: string;
  category?: Category;
  _count?: {
    events: number;
  };
}

export interface CategoryStats {
  totalCategories: number;
  totalSubcategories: number;
  categoriesWithEvents: number;
  topCategories: Category[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private baseUrl = 'http://localhost:3003/api';

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  getEvents(): Observable<{ success: boolean; data: Event[]; total: number }> {
    return this.http.get<{ success: boolean; data: Event[]; total: number }>(`${this.baseUrl}/events?isActive=true`);
  }

  getEvent(id: string): Observable<{ success: boolean; data: Event }> {
    return this.http.get<{ success: boolean; data: Event }>(`${this.baseUrl}/events/${id}`);
  }

  createEvent(event: Partial<Event>): Observable<{ success: boolean; data: Event }> {
    return this.http.post<{ success: boolean; data: Event }>(`${this.baseUrl}/events`, event);
  }

  updateEvent(id: string, event: Partial<Event>): Observable<{ success: boolean; data: Event }> {
    return this.http.put<{ success: boolean; data: Event }>(`${this.baseUrl}/events/${id}`, event);
  }

  deleteEvent(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/events/${id}`);
  }

  getEventStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/events/stats`);
  }

  getVenues(): Observable<{ venues: Venue[]; pagination: any }> {
    return this.http.get<{ venues: Venue[]; pagination: any }>(`${this.baseUrl}/venues?limit=50`);
  }

  getVenue(id: string): Observable<{ success: boolean; data: Venue }> {
    return this.http.get<{ success: boolean; data: Venue }>(`${this.baseUrl}/venues/${id}`);
  }

  createVenue(venue: Partial<Venue>): Observable<{ success: boolean; data: Venue }> {
    return this.http.post<{ success: boolean; data: Venue }>(`${this.baseUrl}/venues`, venue);
  }

  updateVenue(id: string, venue: Partial<Venue>): Observable<{ success: boolean; data: Venue }> {
    return this.http.put<{ success: boolean; data: Venue }>(`${this.baseUrl}/venues/${id}`, venue);
  }

  deleteVenue(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/venues/${id}`);
  }

  getUsers(): Observable<{ success: boolean; users: User[]; total: number }> {
    return this.http.get<{ success: boolean; users: User[]; total: number }>(`${this.baseUrl}/user-management`);
  }

  getUser(id: string): Observable<{ success: boolean; user: User }> {
    return this.http.get<{ success: boolean; user: User }>(`${this.baseUrl}/user-management/${id}`);
  }

  getUserStats(): Observable<{ success: boolean; stats: UserStats }> {
    return this.http.get<{ success: boolean; stats: UserStats }>(`${this.baseUrl}/user-management/stats`);
  }

  promoteToVip(userId: string, data: { reason: string; notes: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/user-management/${userId}/promote`, data);
  }

  demoteFromVip(userId: string, data: { reason: string; notes: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/user-management/${userId}/demote`, data);
  }

  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/dashboard/stats`);
  }

  // ============= CATEGORÍAS =============

  getCategories(params?: any): Observable<{ success: boolean; data: Category[]; pagination: any }> {
    const queryParams = new URLSearchParams(params).toString();
    return this.http.get<{ success: boolean; data: Category[]; pagination: any }>(`${this.baseUrl}/categories?${queryParams}`);
  }

  getCategory(id: number): Observable<{ success: boolean; data: Category }> {
    return this.http.get<{ success: boolean; data: Category }>(`${this.baseUrl}/categories/${id}`);
  }

  createCategory(category: Partial<Category>): Observable<{ success: boolean; data: Category; message: string }> {
    return this.http.post<{ success: boolean; data: Category; message: string }>(`${this.baseUrl}/categories`, category, { headers: this.getAuthHeaders() });
  }

  updateCategory(id: number, category: Partial<Category>): Observable<{ success: boolean; data: Category; message: string }> {
    return this.http.put<{ success: boolean; data: Category; message: string }>(`${this.baseUrl}/categories/${id}`, category, { headers: this.getAuthHeaders() });
  }

  deleteCategory(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/categories/${id}`, { headers: this.getAuthHeaders() });
  }

  // ============= SUBCATEGORÍAS =============

  getSubcategories(params?: any): Observable<{ success: boolean; data: Subcategory[]; pagination: any }> {
    return this.http.get<{ success: boolean; data: Subcategory[]; pagination: any }>(`${this.baseUrl}/categories/subcategories`);
  }

  getSubcategory(id: number): Observable<{ success: boolean; data: Subcategory }> {
    return this.http.get<{ success: boolean; data: Subcategory }>(`${this.baseUrl}/categories/subcategories/${id}`);
  }

  createSubcategory(subcategory: Partial<Subcategory>): Observable<{ success: boolean; data: Subcategory; message: string }> {
    return this.http.post<{ success: boolean; data: Subcategory; message: string }>(`${this.baseUrl}/categories/subcategories`, subcategory, { headers: this.getAuthHeaders() });
  }

  updateSubcategory(id: number, subcategory: Partial<Subcategory>): Observable<{ success: boolean; data: Subcategory; message: string }> {
    return this.http.put<{ success: boolean; data: Subcategory; message: string }>(`${this.baseUrl}/categories/subcategories/${id}`, subcategory, { headers: this.getAuthHeaders() });
  }

  deleteSubcategory(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/categories/subcategories/${id}`, { headers: this.getAuthHeaders() });
  }

  // ============= ESTADÍSTICAS DE CATEGORÍAS =============

  getCategoryStats(): Observable<{ success: boolean; data: CategoryStats }> {
    return this.http.get<{ success: boolean; data: CategoryStats }>(`${this.baseUrl}/categories/stats`);
  }
}
