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

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private baseUrl = 'http://localhost:3003/api';

  constructor(private http: HttpClient) {}

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
}
