import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Restaurant {
  _id?: string;
  companyId: string;
  companyName: string;
  region: string;
  managedBy: string;
  approvalStatus: string;
  lastModifiedBy?: string;
  lastApprovedBy?: string;
  lastApprovedAt?: Date;
  festivalId: string;
  name: string;
  description: string;
  cuisine: string;
  location: string;
  capacity: number;
  currentOccupancy: number;
  schedule: any[];
  menu: any[];
  acceptsReservations: boolean;
  reservationDurationMinutes: number;
  reservationPrice: number;
  status: string;
  isActive: boolean;
  rating?: number;
  totalReviews?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RestaurantStats {
  total: number;
  active: number;
  pending: number;
  approved: number;
  rejected: number;
  byRegion: { [key: string]: number };
}

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {
  private apiUrl = `${environment.festivalApiUrl}/restaurant`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // CRUD Básico
  getAll(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  create(restaurant: Partial<Restaurant>): Observable<any> {
    return this.http.post<any>(this.apiUrl, restaurant, { headers: this.getHeaders() });
  }

  update(id: string, restaurant: Partial<Restaurant>): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}`, restaurant, { headers: this.getHeaders() });
  }

  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // Filtros
  getByFestival(festivalId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?festivalId=${festivalId}`);
  }

  // Capacidad
  getAvailableCapacity(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/capacity`);
  }

  updateOccupancy(id: string, change: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/occupancy`, { change }, { headers: this.getHeaders() });
  }

  // Reservas
  getReservations(restaurantId?: string, userId?: string): Observable<any> {
    let url = `${this.apiUrl}/reservations`;
    const params: string[] = [];
    if (restaurantId) params.push(`restaurantId=${restaurantId}`);
    if (userId) params.push(`userId=${userId}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    return this.http.get<any>(url);
  }

  getReservationStats(restaurantId?: string): Observable<any> {
    let url = `${this.apiUrl}/reservations/stats`;
    if (restaurantId) url += `?restaurantId=${restaurantId}`;
    return this.http.get<any>(url);
  }

  getAvailableSlots(restaurantId: string, date: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${restaurantId}/available-slots?date=${date}`);
  }

  createReservation(reservation: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reservations`, reservation, { headers: this.getHeaders() });
  }

  confirmReservation(id: string, tableNumber?: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reservations/${id}/confirm`, { tableNumber }, { headers: this.getHeaders() });
  }

  cancelReservation(id: string, reason?: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reservations/${id}/cancel`, { reason }, { headers: this.getHeaders() });
  }

  completeReservation(id: string, actualPrice?: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reservations/${id}/complete`, { actualPrice }, { headers: this.getHeaders() });
  }

  // Estadísticas locales (calculadas en frontend)
  calculateStats(restaurants: Restaurant[]): RestaurantStats {
    const stats: RestaurantStats = {
      total: restaurants.length,
      active: restaurants.filter(r => r.isActive).length,
      pending: restaurants.filter(r => r.approvalStatus === 'PENDING').length,
      approved: restaurants.filter(r => r.approvalStatus === 'APPROVED').length,
      rejected: restaurants.filter(r => r.approvalStatus === 'REJECTED').length,
      byRegion: {}
    };

    restaurants.forEach(r => {
      stats.byRegion[r.region] = (stats.byRegion[r.region] || 0) + 1;
    });

    return stats;
  }
}
