import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-payment-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full">
        
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <i class="fas fa-lock text-3xl text-blue-600"></i>
          </div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Pago Seguro</h1>
          <p class="text-gray-500">Procesamiento de pago</p>
        </div>

        <!-- Order Summary -->
        <div class="bg-gray-50 rounded-lg p-6 mb-6" *ngIf="orderInfo">
          <h3 class="font-semibold text-gray-900 mb-4">Resumen de compra</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Evento:</span>
              <span class="font-medium">{{orderInfo.eventName}}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Cantidad:</span>
              <span class="font-medium">{{orderInfo.quantity}} entrada(s)</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Localidad:</span>
              <span class="font-medium">{{orderInfo.localityName}}</span>
            </div>
            <div class="border-t pt-2 mt-2 flex justify-between">
              <span class="font-semibold text-gray-900">Total:</span>
              <span class="font-bold text-xl text-blue-600">{{orderInfo.total}}€</span>
            </div>
          </div>
        </div>

        <!-- Payment Form -->
        <div class="space-y-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <i class="fas fa-credit-card mr-2"></i>Número de Tarjeta
            </label>
            <input type="text" [(ngModel)]="cardNumber" 
                   placeholder="1234 5678 9012 3456"
                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
              <input type="text" [(ngModel)]="expiry" 
                     placeholder="MM/AA"
                     class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">CVC</label>
              <input type="text" [(ngModel)]="cvc" 
                     placeholder="123"
                     class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>
          </div>
        </div>

        <!-- Security Badge -->
        <div class="flex items-center justify-center gap-4 mb-6 text-xs text-gray-500">
          <div class="flex items-center gap-1">
            <i class="fas fa-shield-alt text-green-600"></i>
            <span>Pago seguro</span>
          </div>
          <div class="flex items-center gap-1">
            <i class="fas fa-lock text-green-600"></i>
            <span>Encriptado SSL</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-3">
          <button (click)="processPayment()" 
                  [disabled]="processing"
                  class="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
            <i class="fas fa-lock mr-2"></i>
            <span *ngIf="!processing">Pagar {{orderInfo?.total}}€</span>
            <span *ngIf="processing">Procesando...</span>
          </button>
          
          <button (click)="cancel()" 
                  [disabled]="processing"
                  class="w-full px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
            <i class="fas fa-arrow-left mr-2"></i>Cancelar
          </button>
        </div>

        <!-- Powered by -->
        <div class="text-center mt-6 text-xs text-gray-400">
          <i class="fas fa-shield-alt mr-1"></i>
          Powered by Ticketing Platform
        </div>
      </div>
    </div>
  `
})
export class PaymentCheckoutComponent implements OnInit {
  orderId: string = '';
  processing: boolean = false;
  cardNumber: string = '4242 4242 4242 4242';
  expiry: string = '12/25';
  cvc: string = '123';
  orderInfo: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.orderId = this.route.snapshot.queryParams['orderId'] || '';

    if (!this.orderId) {
      Swal.fire('Error', 'Orden no especificada', 'error').then(() => {
        this.router.navigate(['/shop']);
      });
      return;
    }

    this.loadOrderInfo();
  }

  loadOrderInfo() {
    // Detectar si es orden de Admin Service (UUID con guiones) o Festival Services (MongoDB ObjectId)
    const isAdminOrder = this.orderId.includes('-'); // UUIDs tienen guiones
    
    if (isAdminOrder) {
      // Orden de Admin Service (solo tickets)
      this.http.get<any>(`http://localhost:3003/api/orders/${this.orderId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      }).subscribe({
        next: (response) => {
          if (response.success) {
            const order = response.data;
            this.orderInfo = {
              eventName: order.event?.name || 'Evento',
              localityName: order.locality?.name || 'General',
              quantity: order.quantity,
              total: Number(order.finalAmount).toFixed(2)
            };
          }
        },
        error: (error) => {
          console.error('Error loading order from Admin Service:', error);
          this.orderInfo = {
            eventName: 'Evento',
            localityName: 'General',
            quantity: 1,
            total: '0.00'
          };
        }
      });
    } else {
      // Orden de Festival Services (packs)
      this.http.get<any>(`http://localhost:3004/api/order/${this.orderId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      }).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            const order = response.data;
            this.orderInfo = {
              eventName: order.eventName || order.event?.name || 'Evento',
              localityName: order.tripName || order.restaurantName || order.locality?.name || 'Paquete',
              quantity: order.ticketQuantity || order.quantity || 1,
              total: Number(order.total || order.finalAmount || 0).toFixed(2)
            };
          }
        },
        error: (error) => {
          console.error('Error loading order from Festival Services:', error);
          this.orderInfo = {
            eventName: 'Evento',
            localityName: 'Paquete',
            quantity: 1,
            total: '0.00'
          };
        }
      });
    }
  }

  processPayment() {
    if (this.processing) return;

    if (!this.cardNumber || !this.expiry || !this.cvc) {
      Swal.fire('Error', 'Por favor completa todos los campos', 'error');
      return;
    }

    this.processing = true;

    Swal.fire({
      title: 'Procesando pago...',
      text: 'Validando información de pago',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    setTimeout(() => {
      console.log('💳 Enviando petición de pago para orden:', this.orderId);
      
      // Detectar tipo de orden por formato del ID
      const isAdminOrder = this.orderId.includes('-'); // UUIDs tienen guiones
      
      if (isAdminOrder) {
        // Orden de Admin Service (solo tickets)
        this.http.post<any>('http://localhost:3003/api/payments/complete-payment', 
          { orderId: this.orderId },
          { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }}
        ).subscribe({
          next: (response) => {
            console.log('✅ Respuesta del pago (Admin Service):', response);
            this.processing = false;
            if (response.success) {
              console.log('🎫 Tickets generados:', response.data?.tickets?.length || 0);
              Swal.fire({
                icon: 'success',
                title: '¡Pago Exitoso!',
                html: `
                  <div class="text-start">
                    <p class="mb-2">✅ Pago procesado correctamente</p>
                    <p class="mb-2">✅ Tus entradas han sido generadas</p>
                    <p class="text-muted small">Puedes verlas en tu perfil</p>
                  </div>
                `,
                confirmButtonText: 'Ver mis entradas'
              }).then(() => {
                this.router.navigate(['/profile']);
              });
            }
          },
          error: (error) => {
            this.processing = false;
            console.error('❌ Error procesando pago:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error en el pago',
              text: error.error?.details || error.error?.error || 'No se pudo procesar el pago',
              confirmButtonText: 'Reintentar'
            });
          }
        });
      } else {
        // Orden de Festival Services (packs)
        this.http.post<any>('http://localhost:3004/api/order/complete-payment', 
          { orderId: this.orderId },
          { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }}
        ).subscribe({
          next: (response) => {
            console.log('✅ Respuesta del pago (Festival Services):', response);
            this.processing = false;
            if (response.success) {
              Swal.fire({
                icon: 'success',
                title: '¡Pago Exitoso!',
                html: `
                  <div class="text-start">
                    <p class="mb-2">✅ Pago procesado correctamente</p>
                    <p class="mb-2">✅ Tu compra ha sido confirmada</p>
                    <p class="text-muted small">Puedes ver los detalles en tu perfil</p>
                  </div>
                `,
                confirmButtonText: 'Ir a mi perfil'
              }).then(() => {
                this.router.navigate(['/profile']);
              });
            }
          },
          error: (error) => {
            this.processing = false;
            console.error('❌ Error procesando pago:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error en el pago',
              text: error.error?.details || error.error?.error || 'No se pudo procesar el pago',
              confirmButtonText: 'Reintentar'
            });
          }
        });
      }
    }, 2000);
  }

  cancel() {
    if (this.processing) return;
    this.router.navigate(['/shop']);
  }
}
