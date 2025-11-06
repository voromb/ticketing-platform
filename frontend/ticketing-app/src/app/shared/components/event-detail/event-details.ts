import { Component, OnInit, OnDestroy, Input, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TicketService } from '../../../core/services/ticket.service';
import { AuthService } from '../../../core/services/auth.service';
import { EventService } from '~/app/core/services/event.service';
import { MerchStateService } from '~/app/core/services/merch-state.service';
import { IEvent } from '../../../core/models/Event.model';
import { TravelService, Trip } from '../../../core/services_enterprise/travel.service';
import { RestaurantService, Restaurant } from '../../../core/services_enterprise/restaurant.service';
import { MerchandisingService, Product } from '../../../core/services_enterprise/merchandising.service';
import { OrderService, CreateOrderDto } from '../../../core/services_enterprise/order.service';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './event-details.html',
  styleUrls: ['./event-details.css'],
})
export class EventDetailComponent implements OnInit, OnDestroy {
  @Input() event!: IEvent;

  // Disponibilidad de servicios
  availableTrips: Trip[] = [];
  availableRestaurants: Restaurant[] = [];
  availableProducts: Product[] = [];

  // Modal unificado
  showPackageModal = false;

  // Selecciones
  selectedTrip: Trip | null = null;
  selectedRestaurant: Restaurant | null = null;
  selectedProducts: Product[] = [];

  private merchSubscription?: Subscription;

  constructor(
    private ticketService: TicketService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private eventService: EventService,
    private travelService: TravelService,
    private restaurantService: RestaurantService,
    private merchandisingService: MerchandisingService,
    private orderService: OrderService,
    private merchStateService: MerchStateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('🚀 EventDetailComponent ngOnInit called');
    this.loadEventData();
    
    // Suscribirse a los cambios en la selección de productos
    this.merchSubscription = this.merchStateService.selectedProducts$.subscribe(products => {
      this.selectedProducts = products;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    if (this.merchSubscription) {
      this.merchSubscription.unsubscribe();
    }
  }

  private loadEventData(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    const id = this.route.snapshot.paramMap.get('id');

    console.log('📍 URL params - slug:', slug, 'id:', id);

    if (slug) {
      this.eventService.getEventBySlug(slug).subscribe({
        next: (res) => {
          console.log('✅ Event data received:', res);
          if (res.success) {
            this.event = res.data;
            this.loadAvailableServices();
            this.cdr.detectChanges();
          }
        },
        error: (err) => {
          console.error('❌ Error loading event:', err);
        },
      });
    } else if (id) {
      this.eventService.getEventById(id).subscribe({
        next: (res) => {
          console.log('✅ Event data received by ID:', res);
          if (res.success) {
            this.event = res.data;
            this.loadAvailableServices();
            this.cdr.detectChanges();
          }
        },
        error: (err) => {
          console.error('❌ Error loading event by ID:', err);
        },
      });
    }
  }

  private loadAvailableServices(): void {
    if (!this.event || !this.event.id) return;

    const festivalId = this.event.id;
    console.log('%c🎟️ Cargando servicios disponibles para festival ID: ' + festivalId, 'color: #22c55e; font-weight: bold;');
    // Cargar viajes
    this.travelService.getByFestival(festivalId).subscribe({
      next: (trips) => {
        this.availableTrips = trips;
        console.log('✅ Viajes disponibles:', trips.length);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando viajes:', err)
    });

    // Cargar restaurantes
    this.restaurantService.getByFestival(festivalId).subscribe({
      next: (restaurants) => {
        this.availableRestaurants = restaurants;
        console.log('✅ Restaurantes disponibles:', restaurants.length);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando restaurantes:', err)
    });

    // Cargar merchandising
    this.merchandisingService.getProducts(festivalId).subscribe({
      next: (products) => {
        this.availableProducts = products;
        console.log('✅ Productos disponibles:', products.length);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando productos:', err)
    });
  }

  get isLoggedIn(): boolean {
    return !!this.authService.isAuthenticated();
  }

  get isVip(): boolean {
    const user = this.authService.getCurrentUser();
    return user ? ['vip', 'VIP'].includes(user.role) : false;
  }

  get canBuy(): boolean {
    return this.isLoggedIn;
  }

  get canReserve(): boolean {
    return this.isLoggedIn && this.isVip;
  }

  async buy(): Promise<void> {
    if (!this.event || !this.event.id) return;
    const quantity = await this.ticketService.selectQuantityModal(this.event.name);
    if (quantity != null) await this.ticketService.processPurchase(this.event.id, quantity);
  }

  //   async onBuy(event: IEvent): Promise<void> {
  //   if (!event.id) return;
  //   const quantity = await this.ticketService.selectQuantityModal(event.name);
  //   if (quantity) await this.ticketService.processPurchase(event.id, quantity);
  // }

  async reserve(): Promise<void> {
    if (!this.event || !this.event.id) return;
    const quantity = await this.ticketService.selectQuantityModal(this.event.name, true);
    if (quantity != null) await this.ticketService.processReservation(this.event.id, quantity);
  }

  // ==================== MÉTODOS DE PAQUETES ====================

  async buyTicketOnly(): Promise<void> {
    if (!this.event || !this.event.id) return;
    const quantity = await this.ticketService.selectQuantityModal(this.event.name);
    if (quantity != null) await this.ticketService.processPurchase(this.event.id, quantity);
  }

  openPackageModal(): void {
    this.showPackageModal = true;
  }

  selectTrip(trip: Trip): void {
    this.selectedTrip = trip;
  }

  selectRestaurant(restaurant: Restaurant): void {
    this.selectedRestaurant = restaurant;
  }

  toggleProduct(product: Product): void {
    // Usar el servicio para mantener sincronización con MerchaCard
    this.merchStateService.toggleProduct(product);
  }

  isProductSelected(product: Product): boolean {
    // Usar el servicio para mantener sincronización con MerchaCard
    return this.merchStateService.isProductSelected(product);
  }

  async confirmPackage(): Promise<void> {
    if (!this.event) return;
    
    const quantity = await this.ticketService.selectQuantityModal(this.event.name);
    if (quantity != null) {
      // Obtener datos del usuario
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Debes iniciar sesión para realizar una compra',
          confirmButtonColor: '#ef4444'
        });
        return;
      }

      // Calcular precio total
      const ticketTotal = this.event.minPrice * quantity;
      let totalPrice = ticketTotal;
      const items = [`Ticket: ${this.event.name} x${quantity}`];
      
      // Preparar datos de merchandising
      const merchandisingItems = this.selectedProducts.map(p => ({
        productId: p._id,
        productName: p.name,
        quantity: 1,
        price: p.price,
        total: p.price
      }));
      
      const merchandisingTotal = this.selectedProducts.reduce((sum, p) => sum + p.price, 0);
      
      if (this.selectedTrip) {
        totalPrice += this.selectedTrip.price;
        items.push(`Viaje: ${this.selectedTrip.name}`);
      }
      
      if (this.selectedRestaurant) {
        totalPrice += (this.selectedRestaurant.reservationPrice || 0);
        items.push(`Restaurante: ${this.selectedRestaurant.name}`);
      }
      
      if (this.selectedProducts.length > 0) {
        totalPrice += merchandisingTotal;
        items.push(`Merchandising: ${this.selectedProducts.length} artículo(s)`);
      }

      // Crear objeto de orden
      const orderData: CreateOrderDto = {
        userId: currentUser.id,
        userEmail: currentUser.email,
        userName: `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.email,
        festivalId: this.event.id!,
        eventId: this.event.id!,
        eventName: this.event.name,
        ticketQuantity: quantity,
        ticketPrice: this.event.minPrice,
        ticketTotal: ticketTotal,
        tripId: this.selectedTrip?._id,
        tripName: this.selectedTrip?.name,
        tripPrice: this.selectedTrip?.price,
        restaurantId: this.selectedRestaurant?._id,
        restaurantName: this.selectedRestaurant?.name,
        restaurantPrice: this.selectedRestaurant?.reservationPrice,
        numberOfPeople: quantity,
        merchandising: merchandisingItems.length > 0 ? merchandisingItems : undefined,
        merchandisingTotal: merchandisingTotal > 0 ? merchandisingTotal : undefined,
        subtotal: totalPrice,
        taxes: 0,
        total: totalPrice,
        paymentMethod: 'PENDING'
      };

      // Mostrar loading
      Swal.fire({
        title: 'Procesando compra...',
        html: `
          <div class="text-left">
            ${items.map(item => `<p><strong>•</strong> ${item}</p>`).join('')}
            <hr style="margin: 1rem 0; border-color: #475569;">
            <p style="font-size: 1.2rem;"><strong>Total:</strong> €${totalPrice.toFixed(2)}</p>
          </div>
        `,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Enviar orden al backend
      this.orderService.createOrder(orderData).subscribe({
        next: (response) => {
          console.log('📦 Respuesta del servidor:', response);
          
          if (response.success) {
            const orderId = response.data._id || response.data.id;
            
            // Cerrar el loading
            Swal.close();
            
            // Redirigir a checkout de pago (Stripe o interno)
            this.router.navigate(['/payment/checkout'], {
              queryParams: { orderId: orderId }
            });
            
            this.closeModal();
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error en la compra',
              text: response.message || 'No se pudo procesar la orden',
              confirmButtonColor: '#ef4444'
            });
          }
        },
        error: (error) => {
          console.error('Error creando orden:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al procesar tu compra. Intenta nuevamente.',
            confirmButtonColor: '#ef4444'
          });
        }
      });
    }
  }

  closeModal(): void {
    this.showPackageModal = false;
    this.selectedTrip = null;
    this.selectedRestaurant = null;
    // Limpiar la selección de productos usando el servicio
    this.merchStateService.clearSelection();
  }
}
