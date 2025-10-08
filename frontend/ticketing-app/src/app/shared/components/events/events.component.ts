import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';

import { EventService } from '../../../core/services/event.service';
import { CategoryService } from '../../../core/services/categories.service'; // <-- asegúrate de la ruta
import { AuthService } from '../../../core/services/auth.service';
import { TicketService } from '../../../core/services/ticket.service';

import { IEvent } from '../../../core/models/Event.model';
import { ICategory } from '../../../core/models/Categories.model';
import { FiltersComponent } from '../filters/filters';

export interface EventFilterParams {
  categoryId?: number | string;
  minPrice?: number;
  maxPrice?: number;
  query?: string;
  venueId?: string;
}

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, RouterModule, FiltersComponent],
  templateUrl: './events.component.html'
})
export class EventsComponent implements OnInit {
  events: IEvent[] = [];
  loading = true;
  error = '';
  venueId?: string;

  // 🔹 NECESARIO para el template
  listCategories: ICategory[] = [];

  // 🔹 Estado actual de filtros
  filters: EventFilterParams = {};

  constructor(
    private eventService: EventService,
    private categoryService: CategoryService,
    private authService: AuthService,
    private ticketService: TicketService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Cargar categorías para el <app-filters>
    this.categoryService.getAllCategories().subscribe({
      next: cats => (this.listCategories = cats),
      error: () => (this.listCategories = [])
    });

    // Leer venueId si viene en querystring y disparar carga
    this.route.queryParamMap.subscribe(params => {
      this.venueId = params.get('venueId') ?? undefined;
      // Si hay venueId, que forme parte del filtro
      this.filters = { ...this.filters, venueId: this.venueId };
      this.fetchEvents(); // carga inicial sin filtros explícitos
    });
  }

  private fetchEvents(): void {
    this.loading = true;

    // Si tenemos algún filtro activo, usar endpoint filtrado; si no, el general
    const hasAnyFilter =
      !!this.filters.categoryId ||
      !!this.filters.minPrice ||
      !!this.filters.maxPrice ||
      !!this.filters.query ||
      !!this.filters.venueId;

    const request$ = hasAnyFilter
      ? this.eventService.getEventsFiltered(this.filters)
      : (this.venueId
          ? this.eventService.getEventsByVenue(this.venueId)
          : this.eventService.getEvents());

    request$.subscribe({
      next: res => {
        this.events = res.success ? res.data : [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al cargar eventos';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // 🔹 Handler que espera el Output del <app-filters> y del <app-search>
  get_list_filtered(payload: EventFilterParams | string): void {
    // Si el buscador emite un string, lo tratamos como query
    if (typeof payload === 'string') {
      this.filters = { ...this.filters, query: payload || undefined };
    } else {
      this.filters = { ...this.filters, ...payload };
    }
    this.fetchEvents();
  }

  // Getters de permisos (sin cambios)
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

  // Compra / Reserva (como ya lo tenías)
  async onBuy(event: IEvent): Promise<void> {
    if (!event.id) return;
    const quantity = await this.ticketService.selectQuantityModal(event.name);
    if (quantity) await this.ticketService.processPurchase(event.id, quantity);
  }
  async onReserve(event: IEvent): Promise<void> {
    if (!event.id) return;
    const quantity = await this.ticketService.selectQuantityModal(event.name, true);
    if (quantity) await this.ticketService.processReservation(event.id, quantity);
  }
}
