
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IEvent } from '../models/Event.model';



@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = 'http://localhost:3001';

  constructor(private http: HttpClient) {}

getEvents(): Observable<{ success: boolean; data: IEvent[] }> {
  return this.http.get<{ success: boolean; data: IEvent[] }>(`${this.apiUrl}/api/events`);
}

getEventById(id: string): Observable<{ success: boolean; data: IEvent }> {
  return this.http.get<{ success: boolean; data: IEvent }>(`${this.apiUrl}/api/events/${id}`);
}

searchEvents(query: string): Observable<{ success: boolean; data: IEvent[] }> {
  return this.http.get<{ success: boolean; data: IEvent[] }>(`${this.apiUrl}/events/search?q=${query}`);
}
/**PARA RECOGER POR VENUEID LOS EVENTOS */
getEventsByVenue(venueId: string): Observable<{ success: boolean; data: IEvent[] }> {
  return this.http.get<{ success: boolean; data: IEvent[] }>(
    `${this.apiUrl}/api/events?venueId=${venueId}`
  );
}
}
