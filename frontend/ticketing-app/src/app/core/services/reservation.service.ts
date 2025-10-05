import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = 'http://localhost:3003/api/reservations';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Crear reserva (solo VIP)
  createReservation(eventId: string, localityId: string, quantity: number): Observable<any> {
    return this.http.post<any>(
      this.apiUrl,
      { eventId, localityId, quantity },
      { headers: this.getAuthHeaders() }
    );
  }

  // Obtener mis reservas
  getMyReservations(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/my-reservations`,
      { headers: this.getAuthHeaders() }
    );
  }

  // Obtener reserva por ID
  getReservationById(id: string): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // Cancelar reserva
  cancelReservation(id: string): Observable<any> {
    return this.http.delete<any>(
      `${this.apiUrl}/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }
}
