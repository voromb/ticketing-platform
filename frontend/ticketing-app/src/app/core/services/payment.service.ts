import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Crear sesión de checkout Stripe
  createCheckoutSession(orderId: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/create-checkout`,
      { orderId },
      { headers: this.getAuthHeaders() }
    );
  }

  // Verificar estado de pago
  checkPaymentStatus(sessionId: string): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/status/${sessionId}`,
      { headers: this.getAuthHeaders() }
    );
  }
}
