import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../../../core/services/event.service';
import { IEvent } from '../../../core/models/Event.model';
import { ActivatedRoute } from '@angular/router';

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
    private route: ActivatedRoute
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
      },
      error: () => {
        this.error = 'Error al cargar eventos';
        this.loading = false;
      }
    });
  }
}
