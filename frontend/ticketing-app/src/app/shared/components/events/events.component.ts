import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '~/app/core/services/event.service';
import { IEvent } from '~/app/core/models/Event.model';
import { EventFilterParams } from './events.types';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './events.component.html',
})
export class EventsComponent implements OnChanges {
  @Input() filters: EventFilterParams | null = null;

  events: IEvent[] = [];
  loading = false;
  error = '';

  constructor(private eventService: EventService) {}

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
}
