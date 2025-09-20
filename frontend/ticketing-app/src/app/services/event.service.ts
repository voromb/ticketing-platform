import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface IEvent {
  _id: string;
  name: string;
  description: string;
  date: Date;
  venue: {
    name: string;
    address: string;
    capacity: number;
  };
  totalCapacity: number;
  availableSeats: number;
  basePrice: number;
  status: string;
  imageUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = 'http://localhost:3001/api';

  constructor(private http: HttpClient) {}

  getEvents(): Observable<{success: boolean, data: IEvent[]}> {
    return this.http.get<{success: boolean, data: IEvent[]}>(`${this.apiUrl}/events`);
  }

  getEventById(id: string): Observable<{success: boolean, data: IEvent}> {
    return this.http.get<{success: boolean, data: IEvent}>(`${this.apiUrl}/events/${id}`);
  }

  searchEvents(query: string): Observable<{success: boolean, data: IEvent[]}> {
    return this.http.get<{success: boolean, data: IEvent[]}>(`${this.apiUrl}/events/search?q=${query}`);
  }
}
