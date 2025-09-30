import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../../../core/services/event.service';
import { IEvent } from '../../../core/models/Event.model';
import { ChangeDetectorRef } from '@angular/core';

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

  constructor(
    private eventService: EventService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
  this.loading = true;
  this.eventService.getEvents().subscribe({
    next: (response) => {
      if (response.success) {
        this.events = response.data;
      } else {
        this.error = 'No se pudieron cargar los eventos';
      }
      this.loading = false;
      this.cdr.detectChanges(); // 👈 fuerza la actualización del template
    },
    error: () => {
      this.error = 'Error al cargar eventos';
      this.loading = false;
      this.cdr.detectChanges();
    }
  });
}
}
