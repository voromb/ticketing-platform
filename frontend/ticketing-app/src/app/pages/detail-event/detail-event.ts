import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef
} from '@angular/core';
import { IEvent } from '~/app/core/models/Event.model';
import { EventService } from '~/app/core/services/event.service';
import { CarouselComponent } from '~/app/shared/components/list-carousel/carousel.component';
import { EventDetailComponent } from '~/app/shared/components/event-detail/event-details';
import { SocialInteractionsComponent } from '~/app/shared/components/social-interactions/social-interactions.component';
import { Router, ActivatedRoute } from '@angular/router';

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
  eventSlug = '';
  eventId = '';

  constructor(
    private eventService: EventService,
    private router: Router,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.eventSlug = this.route.snapshot.paramMap.get('slug') || '';
    this.eventId = this.route.snapshot.paramMap.get('id') || '';

    console.log('📍 Parámetros de ruta - slug:', this.eventSlug, 'id:', this.eventId);

    this.loadEvent();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // por si necesitas manejar cambios de inputs más adelante
  }

  loadEvent(): void {
    this.loading = true;

    const handleResponse = (res: any) => {
      if (res.success && res.data) {
        this.events = [res.data];
        this.currentEventId = res.data.id || '';
        console.log('✅ Evento cargado:', res.data);
      } else {
        this.error = 'No se pudo cargar el evento';
      }
      this.loading = false;
      this.cdRef.detectChanges(); // 👈 fuerza render inmediato
    };

    const handleError = (err: any) => {
      console.error('❌ Error cargando evento:', err);
      this.error = 'Error al cargar el evento';
      this.loading = false;
      this.cdRef.detectChanges();
    };

    if (this.eventSlug) {
      this.eventService.getEventBySlug(this.eventSlug).subscribe({
        next: handleResponse,
        error: handleError
      });
    } else if (this.eventId) {
      this.eventService.getEventById(this.eventId).subscribe({
        next: handleResponse,
        error: handleError
      });
    } else {
      this.loadEvents();
    }
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
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Error en la API:', err);
        this.error = 'Error al cargar eventos';
        this.loading = false;
        this.cdRef.detectChanges();
      }
    });
  }

  redirectToLogin(): void {
    this.router.navigate(['/login']);
  }
}
