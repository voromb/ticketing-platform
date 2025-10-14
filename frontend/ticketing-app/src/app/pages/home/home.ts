import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselComponent } from '../../shared/components/list-carousel/carousel.component';
import { ListCard } from '../../shared/components/list-card/list-card';
import { EventService } from '~/app/core/services/event.service';
import { IEvent } from '~/app/core/models/Event.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CarouselComponent, ListCard],
  templateUrl: './home.html',
})
export class Home implements OnInit {
  events: IEvent[] = [];
  loading = true;
  error = '';

  constructor(private eventService: EventService, private cdr: ChangeDetectorRef) {
    console.log('🏗️ Home constructor called');
  }

  ngOnInit(): void {
    console.log('🚀 Home ngOnInit called');
    this.loadHomeData();
  }

  private loadHomeData(): void {
    console.log('🔄 Loading home data...');
    this.loading = true;
    this.error = '';

    // Cargar eventos para el carrusel (primeros 10)
    this.eventService.getEventsFiltered({ page: 1, limit: 10 }).subscribe({
      next: (res) => {
        console.log('✅ Eventos para carrusel recibidos:', res);
        this.events = res.data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('❌ Error cargando eventos para carrusel', err);
        this.error = 'Error al cargar eventos';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
