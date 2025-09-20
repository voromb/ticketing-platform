import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService, IEvent } from '../../services/event.service';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './events.component.html'
})
export class EventsComponent implements OnInit {
  title = 'Ticketing Platform';
  events: IEvent[] = [
    {
      _id: '1',
      name: 'Wacken Open Air 2025',
      description: 'El festival de metal más grande del mundo. 3 días de puro metal con las mejores bandas internacionales.',
      date: new Date('2025-08-01T18:00:00'),
      venue: {
        name: 'Wacken Festival Grounds',
        address: 'Wacken, Alemania',
        capacity: 85000
      },
      totalCapacity: 85000,
      availableSeats: 12500,
      basePrice: 285,
      status: 'published',
      imageUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14'
    },
    {
      _id: '2', 
      name: 'Hellfest 2025',
      description: 'Festival francés de metal extremo. Death, black, doom y más géneros underground en un ambiente único.',
      date: new Date('2025-06-20T16:00:00'),
      venue: {
        name: 'Hellfest Grounds',
        address: 'Clisson, Francia',
        capacity: 60000
      },
      totalCapacity: 60000,
      availableSeats: 8750,
      basePrice: 220,
      status: 'published',
      imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f'
    },
    {
      _id: '3',
      name: 'Metallica World Tour',
      description: 'Los maestros del thrash metal regresan con su gira mundial. Una noche épica de metal clásico.',
      date: new Date('2025-07-15T20:30:00'),
      venue: {
        name: 'Estadio Wanda Metropolitano',
        address: 'Madrid, España',
        capacity: 68000
      },
      totalCapacity: 68000,
      availableSeats: 15200,
      basePrice: 95,
      status: 'published',
      imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7'
    },
    {
      _id: '4',
      name: 'Download Festival Madrid',
      description: 'Rock y metal en estado puro. Bandas legendarias y nuevas promesas del metal en un solo lugar.',
      date: new Date('2025-06-28T17:00:00'),
      venue: {
        name: 'Caja Mágica',
        address: 'Madrid, España', 
        capacity: 45000
      },
      totalCapacity: 45000,
      availableSeats: 6800,
      basePrice: 165,
      status: 'published',
      imageUrl: 'https://images.unsplash.com/photo-1501612780327-45045538702b'
    }
  ];
  loading = false;
  error = '';

  constructor(private eventService: EventService) {}

  ngOnInit() {
    // Eventos hardcoded, no necesitamos cargar del backend por ahora
  }
}
