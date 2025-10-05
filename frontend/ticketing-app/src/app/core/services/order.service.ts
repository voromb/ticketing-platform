import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:3003/api/orders';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Crear orden
  createOrder(eventId: string, localityId: string, quantity: number, reservationId?: string): Observable<any> {
    return this.http.post<any>(
      this.apiUrl,
      { eventId, localityId, quantity, reservationId },
      { headers: this.getAuthHeaders() }
    );
  }

  // Obtener mis órdenes
  getMyOrders(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/my-orders`,
      { headers: this.getAuthHeaders() }
    );
  }

  // Obtener orden por ID
  getOrderById(id: string): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }
}
