import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventService } from '~/app/core/services/event.service';
import { AuthService } from '~/app/core/services/auth.service';
import { IEvent } from '~/app/core/models/Event.model';
import { EventFilterParams } from './events.types';
import { PaginationComponent } from '../pagination/pagination';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, RouterModule, PaginationComponent],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css'], // CORREGIDO
  changeDetection: ChangeDetectionStrategy.Default, // Asegurar estrategia por defecto
})
export class EventsComponent implements OnInit, OnChanges {
  @Input() filters: EventFilterParams | null = null;

  events: IEvent[] = [];
  loading = false;
  error = '';
  private hasInitialized = false; // Flag para evitar doble carga

  // Paginación
  currentPage = 1;
  totalPages = 1;
  pageSize = 10;

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    console.log('🏗️ EventsComponent constructor called');
  }

  ngOnInit() {
    console.log('🚀 EventsComponent ngOnInit called');
    // Cargar eventos al inicializar SIEMPRE
    this.hasInitialized = true;
    this.loadEvents();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('🔄 ngOnChanges called:', changes);
    // Solo recargar si ya se inicializó y los filtros cambian
    if (changes['filters'] && this.hasInitialized) {
      console.log('🔄 Filtros cambiaron después de init, recargando');
      this.currentPage = 1; // Resetear página
      this.loadEvents();
    }
  }

  private loadEvents(page: number = 1): void {
    console.log('🔄 loadEvents called with page:', page);
    console.log('🔄 Current filters:', this.filters);
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges(); // Forzar detección de cambios

    const params = { ...this.filters, page, limit: this.pageSize };
    console.log('🔄 Request params:', params);

    this.eventService.getEventsFiltered(params).subscribe({
      next: (res) => {
        console.log('✅ Eventos recibidos:', res);
        this.events = res.data;
        this.currentPage = res.page;
        this.totalPages = res.totalPages;
        this.loading = false;
        this.cdr.detectChanges(); // Forzar detección de cambios
        console.log('✅ Loading set to false with detectChanges()');
      },
      error: (err) => {
        console.error('❌ Error cargando eventos', err);
        this.error = 'Error al cargar eventos';
        this.loading = false;
        this.cdr.detectChanges(); // Forzar detección de cambios
        console.log('❌ Loading set to false due to error with detectChanges()');
      },
    });
  }

  // Métodos de paginación
  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.loadEvents(page);
  }

  previousPage() {
    this.goToPage(this.currentPage - 1);
  }

  nextPage() {
    this.goToPage(this.currentPage + 1);
  }

  onPageChange(page: number): void {
    this.loadEvents(page);
  }

  // Getters para el template
  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  get canReserve(): boolean {
    const user = this.authService.getCurrentUser();
    return user !== null && ['vip', 'VIP'].includes(user.role);
  }

  get canBuy(): boolean {
    return this.isLoggedIn;
  }

  // Métodos de acciones
  onReserve(event: IEvent): void {
    console.log('Reservar evento:', event);
    // TODO: Implementar lógica de reserva
  }

  onBuy(event: IEvent): void {
    console.log('Comprar evento:', event);
    // TODO: Implementar lógica de compra
  }
}
