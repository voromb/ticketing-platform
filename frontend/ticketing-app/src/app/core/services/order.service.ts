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
    // Convertir al nuevo formato que espera el backend
    const orderData = {
      eventId,
      tickets: [
        {
          localityId,
          quantity,
        },
      ],
    };

    // Agregar reservationId si existe
    if (reservationId) {
      (orderData as any).reservationId = reservationId;
    }

    return this.http.post<any>(this.apiUrl, orderData, { headers: this.getAuthHeaders() });
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
