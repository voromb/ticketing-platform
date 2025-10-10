
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';
import { IEvent } from '../models/Event.model';



@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = 'http://localhost:3003';

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


getEventsFiltered(params: {
  categoryId?: number | string | null;
  subcategoryId?: number | string | null;
  venueId?: string;
  query?: string;
  minPrice?: number | string | null;  
  maxPrice?: number | string | null;  
}): Observable<{ success: boolean; data: IEvent[] }> {
  let httpParams = new HttpParams();

  if (params.categoryId != null && params.categoryId !== '') {
    httpParams = httpParams.set('categoryId', String(params.categoryId));
  }
  if (params.subcategoryId != null && params.subcategoryId !== '') {
    httpParams = httpParams.set('subcategoryId', String(params.subcategoryId));
  }
  if (params.venueId) httpParams = httpParams.set('venueId', params.venueId);
  if (params.query) httpParams = httpParams.set('query', params.query);

  // 👇 nuevos filtros
  if (params.minPrice != null) httpParams = httpParams.set('minPrice', String(params.minPrice));
  if (params.maxPrice != null) httpParams = httpParams.set('maxPrice', String(params.maxPrice));

  return this.http.get<{ success: boolean; data: IEvent[] }>(
    `${this.apiUrl}/api/events`,
    { params: httpParams }
  );
}


}
