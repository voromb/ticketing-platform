
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Event } from '../models/Event.model';  // ajusta la ruta según tu estructura

@Injectable({
  providedIn: 'root'
})
@Injectable({
  providedIn: 'root'
})
export class EventService {
  private events: Event[] = [
    {
      _id: '1',
      name: 'Wacken Open Air 2025',
      slug: 'wacken-open-air-2025',
      description: 'El festival de metal más grande del mundo...',
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
    slug: 'hellfest-2025',
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
    slug: 'metallica-world-tour',
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
    slug: 'download-festival-madrid',
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

  constructor() {}

  // Retorna todos los eventos como observable
  getEvents(): Observable<Event[]> {
    return of(this.events);
  }
}

// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';

// export interface IEvent {
//   _id: string;
//   name: string;
//   description: string;
//   date: Date;
//   venue: {
//     name: string;
//     address: string;
//     capacity: number;
//   };
//   totalCapacity: number;
//   availableSeats: number;
//   basePrice: number;
//   status: string;
//   imageUrl?: string;
// }
//* Esto hi ha que activaro despres */
// @Injectable({
//   providedIn: 'root'
// })
// export class EventService {
//   private apiUrl = 'http://localhost:3001/api';

//   constructor(private http: HttpClient) {}

//   getEvents(): Observable<{success: boolean, data: Event[]}> {
//     return this.http.get<{success: boolean, data: Event[]}>(`${this.apiUrl}/events`);
//   }

//   getEventById(id: string): Observable<{success: boolean, data: Event}> {
//     return this.http.get<{success: boolean, data: Event}>(`${this.apiUrl}/events/${id}`);
//   }

//   searchEvents(query: string): Observable<{success: boolean, data: Event[]}> {
//     return this.http.get<{success: boolean, data: Event[]}>(`${this.apiUrl}/events/search?q=${query}`);
//   }
// }
