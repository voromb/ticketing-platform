import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { EventService } from '../../../core/services/event.service';
import { AuthService } from '../../../core/services/auth.service';
import { ReservationService } from '../../../core/services/reservation.service';
import { OrderService } from '../../../core/services/order.service';
import { PaymentService } from '../../../core/services/payment.service';
import { IEvent } from '../../../core/models/Event.model';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './events.component.html'
})
export class EventsComponent implements OnInit {
  title = 'Ticketing Platform';
  events: IEvent[] = [];
  loading = true;
  error = '';
  venueId?: string;

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private reservationService: ReservationService,
    private orderService: OrderService,
    private paymentService: PaymentService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Escuchar cambios en los query params (por si se navega entre venues sin recargar componente)
    this.route.queryParamMap.subscribe(params => {
      this.venueId = params.get('venueId') ?? undefined;
      this.fetchEvents();
    });
  }

  private fetchEvents() {
    this.loading = true;
    this.error = '';

    const request$ = this.venueId
      ? this.eventService.getEventsByVenue(this.venueId)
      : this.eventService.getEvents();

    request$.subscribe({
      next: (response) => {
        if (response.success) {
          this.events = response.data;
        } else {
          this.error = 'No se pudieron cargar los eventos';
        }
        this.loading = false;
        
        // Forzar detección de cambios
        setTimeout(() => {
          this.cdr.detectChanges();
        }, 100);
      },
      error: (error) => {
        console.error('Error al cargar eventos:', error);
        this.error = 'Error al cargar eventos';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
  
  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  get isVip(): boolean {
    const user = this.authService.getCurrentUser();
    return user !== null && ['vip', 'VIP'].includes(user.role);
  }

  get canBuy(): boolean {
    return this.isLoggedIn; // Usuario logueado puede comprar
  }

  get canReserve(): boolean {
    return this.isLoggedIn && this.isVip; // Solo VIP puede reservar
  }

  async onBuy(event: IEvent) {
    if (!event.id) {
      Swal.fire('Error', 'Evento inválido', 'error');
      return;
    }

    // Mostrar modal para seleccionar localidad y cantidad
    const result = await Swal.fire({
      title: `Comprar entradas para ${event.name}`,
      html: `
        <div class="text-start">
          <p class="mb-3">Selecciona la cantidad de entradas:</p>
          <input type="number" id="quantity" class="swal2-input" value="1" min="1" max="10" placeholder="Cantidad">
          <p class="text-muted small mt-2">Nota: La selección de localidad se implementará próximamente</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Continuar al pago',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545',
      preConfirm: () => {
        const quantity = (document.getElementById('quantity') as HTMLInputElement).value;
        if (!quantity || parseInt(quantity) < 1) {
          Swal.showValidationMessage('Debes seleccionar al menos 1 entrada');
          return false;
        }
        return { quantity: parseInt(quantity) };
      }
    });

    if (result.isConfirmed && result.value) {
      this.processPurchase(event, result.value.quantity);
    }
  }

  async onReserve(event: IEvent) {
    if (!event.id) {
      Swal.fire('Error', 'Evento inválido', 'error');
      return;
    }

    // Mostrar modal para seleccionar localidad y cantidad
    const result = await Swal.fire({
      title: `🔖 Reservar entradas VIP`,
      html: `
        <div class="text-start">
          <p class="mb-3"><strong>${event.name}</strong></p>
          <p class="mb-3">Selecciona la cantidad de entradas:</p>
          <input type="number" id="quantity" class="swal2-input" value="1" min="1" max="10" placeholder="Cantidad">
          <div class="alert alert-warning mt-3">
            <i class="fas fa-clock me-2"></i>La reserva expirará en 15 minutos
          </div>
          <p class="text-muted small">Nota: La selección de localidad se implementará próximamente</p>
        </div>
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Reservar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ffc107',
      preConfirm: () => {
        const quantity = (document.getElementById('quantity') as HTMLInputElement).value;
        if (!quantity || parseInt(quantity) < 1) {
          Swal.showValidationMessage('Debes seleccionar al menos 1 entrada');
          return false;
        }
        return { quantity: parseInt(quantity) };
      }
    });

    if (result.isConfirmed && result.value) {
      this.processReservation(event, result.value.quantity);
    }
  }

  private processPurchase(event: IEvent, quantity: number) {
    if (!event.id) return;

    const eventId = event.id;
    const token = localStorage.getItem('token');
    console.log('Token para compra:', token ? 'Existe' : 'NO EXISTE');

    // Mostrar loading mientras obtenemos localidades
    Swal.fire({
      title: 'Cargando...',
      text: 'Obteniendo información del evento',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Obtener localidades del evento
    this.http.get<any>(`http://localhost:3003/api/events/${eventId}/localities`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: (response: any) => {
        if (response.success && response.data && response.data.length > 0) {
          const localityId: string = response.data[0].id; // Primera localidad disponible

          Swal.fire({
            title: 'Procesando compra...',
            text: 'Creando orden de compra',
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });

          // 1. Crear orden
          this.orderService.createOrder(eventId, localityId, quantity).subscribe({
            next: (response) => {
              if (response.success) {
                const order = response.data;
                
                // 2. Crear sesión de Stripe
                this.paymentService.createCheckoutSession(order.id).subscribe({
                  next: (paymentResponse) => {
                    if (paymentResponse.success && paymentResponse.data.url) {
                      Swal.close();
                      
                      // Redirigir a Stripe Checkout
                      window.location.href = paymentResponse.data.url;
                    } else {
                      Swal.fire('Error', 'No se pudo crear la sesión de pago', 'error');
                    }
                  },
                  error: (error) => {
                    console.error('Error creando sesión:', error);
                    Swal.fire('Error', 'Error al procesar el pago', 'error');
                  }
                });
              } else {
                Swal.fire('Error', response.error || 'No se pudo crear la orden', 'error');
              }
            },
            error: (error: any) => {
              console.error('Error creando orden:', error);
              Swal.fire('Error', error.error?.error || 'Error al crear la orden', 'error');
            }
          });
        } else {
          Swal.fire('Error', 'Este evento no tiene localidades disponibles', 'error');
        }
      },
      error: (error: any) => {
        console.error('Error obteniendo localidades:', error);
        Swal.fire('Error', 'Error al cargar información del evento', 'error');
      }
    });
  }

  private processReservation(event: IEvent, quantity: number) {
    if (!event.id) return;

    const eventId = event.id;
    const token = localStorage.getItem('token');
    console.log('Token para reserva:', token ? 'Existe' : 'NO EXISTE');

    // Mostrar loading mientras obtenemos localidades
    Swal.fire({
      title: 'Cargando...',
      text: 'Obteniendo información del evento',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Obtener localidades del evento
    this.http.get<any>(`http://localhost:3003/api/events/${eventId}/localities`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: (response: any) => {
        if (response.success && response.data && response.data.length > 0) {
          const localityId: string = response.data[0].id; // Primera localidad disponible

          Swal.fire({
            title: 'Creando reserva...',
            text: 'Reservando tus entradas',
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });

          this.reservationService.createReservation(eventId, localityId, quantity).subscribe({
            next: (response) => {
              if (response.success) {
                const reservation = response.data;
                
                Swal.fire({
                  icon: 'success',
                  title: '¡Reserva creada!',
                  html: `
                    <div class="text-start">
                      <p><strong>Evento:</strong> ${event.name}</p>
                      <p><strong>Cantidad:</strong> ${quantity} entrada(s)</p>
                      <p class="text-warning"><strong>⏰ Expira en 15 minutos</strong></p>
                      <p class="text-muted small">Puedes ver tus reservas en tu panel de usuario</p>
                    </div>
                  `,
                  confirmButtonText: 'Ver mis reservas',
                  showCancelButton: true,
                  cancelButtonText: 'Continuar navegando'
                }).then((result) => {
                  if (result.isConfirmed) {
                    this.router.navigate(['/profile']);
                  }
                });
              } else {
                Swal.fire('Error', response.error || 'No se pudo crear la reserva', 'error');
              }
            },
            error: (error: any) => {
              console.error('Error creando reserva:', error);
              const errorMsg = error.error?.error || 'Error al crear la reserva';
              Swal.fire('Error', errorMsg, 'error');
            }
          });
        } else {
          Swal.fire('Error', 'Este evento no tiene localidades disponibles', 'error');
        }
      },
      error: (error: any) => {
        console.error('Error obteniendo localidades:', error);
        Swal.fire('Error', 'Error al cargar información del evento', 'error');
      }
    });
  }
}
