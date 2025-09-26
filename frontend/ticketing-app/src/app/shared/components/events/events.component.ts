import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../../../core/services/event.service';
import { Event } from '../../../core/models/Event.model';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './events.component.html'
})
export class EventsComponent implements OnInit {
  title = 'Ticketing Platform';
  events: Event[] = [];
  loading = false;
  error = '';

  constructor(private eventService: EventService) {}

  ngOnInit() {
    this.loading = true;
    this.eventService.getEvents().subscribe({
      next: (data) => {
        this.events = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar eventos';
        this.loading = false;
      }
    });
  }
}
