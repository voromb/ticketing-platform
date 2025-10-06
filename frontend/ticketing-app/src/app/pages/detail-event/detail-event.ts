import { Component, OnInit } from '@angular/core';
import { IEvent } from '~/app/core/models/Event.model';
import { EventService } from '~/app/core/services/event.service';
import { CarouselComponent } from '~/app/shared/components/list-carousel/carousel.component';
import { EventDetailsComponent } from '~/app/shared/components/event-detail/event-details';

@Component({
  selector: 'app-detail-event',
  standalone: true,
  imports: [CarouselComponent, EventDetailsComponent],
  templateUrl: './detail-event.html',
})
export class DetailEvent implements OnInit {

  events: IEvent[] = [];

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.eventService.getEvents().subscribe({
      next: (res) => {
        if (res.success) {
          this.events = res.data;
          console.log('Eventos recibidos:', this.events); // <-- Aquí los ves en consola
        } else {
          console.error('Error al recibir eventos');
        }
      },
      error: (err) => console.error('Error en la API:', err)
    });
  }
}
