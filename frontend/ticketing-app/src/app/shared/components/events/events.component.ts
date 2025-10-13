import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventService } from '~/app/core/services/event.service';
import { AuthService } from '~/app/core/services/auth.service';
import { IEvent } from '~/app/core/models/Event.model';
import { EventFilterParams } from './events.types';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './events.component.html',
})
export class EventsComponent implements OnInit, OnChanges {
  @Input() filters: EventFilterParams | null = null;

  events: IEvent[] = [];
  loading = false;
  error = '';

  constructor(private eventService: EventService, private authService: AuthService) {}

  ngOnInit() {
    // Cargar eventos inicialmente
    this.loadEvents();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['filters']) {
      console.log('🟣 Filtros cambiaron:', this.filters);
      this.loadEvents();
    }
  }

  private loadEvents(): void {
    this.loading = true;
    this.error = '';

    this.eventService.getEventsFiltered(this.filters ?? {}).subscribe({
      next: (res) => {
        this.events = res.data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando eventos', err);
        this.error = 'Error al cargar eventos';
        this.loading = false;
      },
    });
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
