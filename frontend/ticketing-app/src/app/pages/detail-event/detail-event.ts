import { Component, OnInit } from '@angular/core';
import { IEvent } from '~/app/core/models/Event.model';
import { EventService } from '~/app/core/services/event.service';
import { CarouselComponent } from '~/app/shared/components/list-carousel/carousel.component';
import { EventDetailComponent } from '~/app/shared/components/event-detail/event-details';

@Component({
  selector: 'app-detail-event',
  standalone: true,
  imports: [CarouselComponent, EventDetailComponent],
  templateUrl: './detail-event.html',
})
export class DetailEvent implements OnInit {
  events: IEvent[] = [];
  loading = true;
  error = '';

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading = true;
    this.eventService.getEvents().subscribe({
      next: (res) => {
        if (res.success) {
          this.events = res.data;
          console.log('Eventos recibidos:', this.events);
        } else {
          this.error = 'No se pudieron cargar los eventos';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error en la API:', err);
        this.error = 'Error al cargar eventos';
        this.loading = false;
      }
    });
  }
}
