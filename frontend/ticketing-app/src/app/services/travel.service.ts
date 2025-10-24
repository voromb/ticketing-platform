import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Trip {
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
  departure: string;
  arrival: string;
  departureTime: Date;
  arrivalTime: Date;
  vehicleType: string;
  vehicleCapacity: number;
  vehiclePlate?: string;
  driverInfo?: any;
  capacity: number;
  price: number;
  bookedSeats: number;
  status: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TripStats {
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
export class TravelService {
  private apiUrl = 'http://localhost:3004/api/travel';

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

  create(trip: Partial<Trip>): Observable<any> {
    return this.http.post<any>(this.apiUrl, trip, { headers: this.getHeaders() });
  }

  update(id: string, trip: Partial<Trip>): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}`, trip, { headers: this.getHeaders() });
  }

  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // Asientos disponibles
  getAvailableSeats(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/available-seats`);
  }

  // Reservas
  getBookings(tripId?: string, userId?: string): Observable<any> {
    let url = `${this.apiUrl}/bookings`;
    const params: string[] = [];
    if (tripId) params.push(`tripId=${tripId}`);
    if (userId) params.push(`userId=${userId}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    return this.http.get<any>(url);
  }

  getBookingStats(tripId?: string): Observable<any> {
    let url = `${this.apiUrl}/bookings/stats`;
    if (tripId) url += `?tripId=${tripId}`;
    return this.http.get<any>(url);
  }

  createBooking(booking: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/bookings`, booking, { headers: this.getHeaders() });
  }

  confirmBooking(id: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/bookings/${id}/confirm`, {}, { headers: this.getHeaders() });
  }

  cancelBooking(id: string, reason?: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/bookings/${id}/cancel`, { reason }, { headers: this.getHeaders() });
  }

  // Estadísticas locales
  calculateStats(trips: Trip[]): TripStats {
    const stats: TripStats = {
      total: trips.length,
      active: trips.filter(t => t.isActive).length,
      pending: trips.filter(t => t.approvalStatus === 'PENDING').length,
      approved: trips.filter(t => t.approvalStatus === 'APPROVED').length,
      rejected: trips.filter(t => t.approvalStatus === 'REJECTED').length,
      byRegion: {}
    };

    trips.forEach(t => {
      stats.byRegion[t.region] = (stats.byRegion[t.region] || 0) + 1;
    });

    return stats;
  }
}
