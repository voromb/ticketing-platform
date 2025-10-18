import { Component, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { IEvent } from '~/app/core/models/Event.model';
import { EventService } from '~/app/core/services/event.service';
import { CarouselComponent } from '~/app/shared/components/list-carousel/carousel.component';
import { EventDetailComponent } from '~/app/shared/components/event-detail/event-details';
import { SocialInteractionsComponent } from '~/app/shared/components/social-interactions/social-interactions.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-detail-event',
  standalone: true,
  imports: [CarouselComponent, EventDetailComponent, SocialInteractionsComponent],
  templateUrl: './detail-event.html',
})
export class DetailEvent implements OnInit, OnChanges {
  events: IEvent[] = [];
  loading = true;
  error = '';
  currentEventId = '';

  constructor(
    private eventService: EventService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Handle any input changes if needed
  }

  loadEvents(): void {
    this.loading = true;
    this.eventService.getEvents().subscribe({
      next: (res) => {
        if (res.success) {
          this.events = res.data;
          this.currentEventId = this.events[0]?.id || '';
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

  redirectToLogin(): void {
    this.router.navigate(['/login']);
  }
}
