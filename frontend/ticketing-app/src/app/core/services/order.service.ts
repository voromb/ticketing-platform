import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

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

  // Obtener mis órdenes (combina Admin Service y Festival Services)
  getMyOrders(): Observable<any> {
    const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
    
    // Petición a Admin Service (órdenes de solo tickets)
    const adminOrders$ = this.http.get<any>(
      `${this.apiUrl}/my-orders`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error cargando órdenes de Admin Service:', error);
        return of({ success: true, data: [] });
      })
    );

    // Petición a Festival Services (órdenes de packs)
    const packageOrders$ = this.http.get<any>(
      `http://localhost:3004/api/order/user/${userId}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error cargando órdenes de Festival Services:', error);
        return of({ success: true, data: [] });
      })
    );

    // Combinar ambas respuestas
    return forkJoin([adminOrders$, packageOrders$]).pipe(
      map(([adminResponse, packageResponse]) => {
        const adminOrders = adminResponse.success ? adminResponse.data : [];
        const packageOrders = packageResponse.success ? packageResponse.data : [];
        
        // Marcar el tipo de orden para distinguirlas en el frontend
        const markedAdminOrders = adminOrders.map((order: any) => ({
          ...order,
          orderType: 'TICKET_ONLY'
        }));
        
        const markedPackageOrders = packageOrders.map((order: any) => ({
          ...order,
          orderType: 'PACKAGE',
          // Adaptar campos para compatibilidad con el frontend
          id: order._id,
          status: order.paymentStatus === 'PAID' ? 'PAID' : order.status
        }));

        // Combinar y ordenar por fecha
        const allOrders = [...markedAdminOrders, ...markedPackageOrders];
        allOrders.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.created_at || 0).getTime();
          const dateB = new Date(b.createdAt || b.created_at || 0).getTime();
          return dateB - dateA; // Más recientes primero
        });

        return {
          success: true,
          data: allOrders
        };
      })
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
