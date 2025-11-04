import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface CreateOrderDto {
  userId: string;
  userEmail: string;
  userName: string;
  festivalId: string;
  eventId: string;
  eventName: string;
  ticketQuantity: number;
  ticketPrice: number;
  ticketTotal: number;
  tripId?: string;
  tripName?: string;
  tripPrice?: number;
  restaurantId?: string;
  restaurantName?: string;
  restaurantPrice?: number;
  reservationDate?: Date;
  reservationTime?: string;
  numberOfPeople?: number;
  merchandising?: OrderItem[];
  merchandisingTotal?: number;
  subtotal: number;
  taxes: number;
  total: number;
  paymentMethod?: string;
}

export interface Order extends CreateOrderDto {
  _id: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  transactionId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:3004/api/order';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  createOrder(orderData: CreateOrderDto): Observable<any> {
    return this.http.post<any>(this.apiUrl, orderData, {
      headers: this.getAuthHeaders()
    });
  }

  getAllOrders(): Observable<any> {
    return this.http.get<any>(this.apiUrl, {
      headers: this.getAuthHeaders()
    });
  }

  getUserOrders(userId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/user/${userId}`, {
      headers: this.getAuthHeaders()
    });
  }

  getOrderById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  updateOrderStatus(id: string, status: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/status`, { status }, {
      headers: this.getAuthHeaders()
    });
  }

  updatePaymentStatus(id: string, paymentStatus: string, transactionId?: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/payment`, 
      { paymentStatus, transactionId }, 
      { headers: this.getAuthHeaders() }
    );
  }
}
