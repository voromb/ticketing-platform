import { Component, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { IEvent } from '~/app/core/models/Event.model';
import { EventService } from '~/app/core/services/event.service';
import { CarouselComponent } from '~/app/shared/components/list-carousel/carousel.component';
import { EventDetailComponent } from '~/app/shared/components/event-detail/event-details';
import { SocialInteractionsComponent } from '~/app/shared/components/social-interactions/social-interactions.component';
import { Router, ActivatedRoute } from '@angular/router';
import { UserSocialStatsComponent } from '~/app/shared/components/user-social-stats/user-social-stats.component';

@Component({
  selector: 'app-detail-event',
  standalone: true,
  imports: [CarouselComponent, EventDetailComponent, SocialInteractionsComponent, UserSocialStatsComponent],
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
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Obtener parámetros de la ruta
    this.eventSlug = this.route.snapshot.paramMap.get('slug') || '';
    this.eventId = this.route.snapshot.paramMap.get('id') || '';
    
    console.log('📍 Parámetros de ruta - slug:', this.eventSlug, 'id:', this.eventId);
    
    this.loadEvent();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Handle any input changes if needed
  }

  loadEvent(): void {
    this.loading = true;
    
    if (this.eventSlug) {
      // Cargar evento por slug
      this.eventService.getEventBySlug(this.eventSlug).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.events = [res.data]; // Convertir a array para el carousel
            this.currentEventId = res.data.id || '';
            console.log('✅ Evento cargado por slug:', res.data);
          } else {
            this.error = 'No se pudo cargar el evento';
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('❌ Error cargando evento por slug:', err);
          this.error = 'Error al cargar el evento';
          this.loading = false;
        }
      });
    } else if (this.eventId) {
      // Cargar evento por ID
      this.eventService.getEventById(this.eventId).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.events = [res.data]; // Convertir a array para el carousel
            this.currentEventId = res.data.id || '';
            console.log('✅ Evento cargado por ID:', res.data);
          } else {
            this.error = 'No se pudo cargar el evento';
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('❌ Error cargando evento por ID:', err);
          this.error = 'Error al cargar el evento';
          this.loading = false;
        }
      });
    } else {
      // Fallback: cargar todos los eventos (comportamiento anterior)
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
