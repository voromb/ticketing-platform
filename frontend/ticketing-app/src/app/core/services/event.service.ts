// src/app/core/services/event.service.ts (The refactored version from the previous answer)

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '~/environments/environment';
import { Observable } from 'rxjs';
import { IEvent } from '../models/Event.model';
import { PaginatedResponse } from '../models/paginated-response.model'; 
import { EventsFilterParams, VenueSlugParams } from '../models/event-params.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly baseUrl: string = environment.apiUrl;
  private readonly eventsUrl: string = `${this.baseUrl}/events`;

  constructor(private http: HttpClient) {}


  private buildHttpParams(params: { [key: string]: any }): HttpParams {
    let httpParams = new HttpParams();


    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value != null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });

    return httpParams;
  }

  // --- CRUD/Basic Fetch Operations ---

  getEvents(): Observable<{ success: boolean; data: IEvent[] }> {
    return this.http.get<{ success: boolean; data: IEvent[] }>(this.eventsUrl);
  }

  getEventById(id: string): Observable<{ success: boolean; data: IEvent }> {
    return this.http.get<{ success: boolean; data: IEvent }>(`${this.eventsUrl}/${id}`);
  }

  getEventBySlug(slug: string): Observable<{ success: boolean; data: IEvent }> {

    return this.http.get<{ success: boolean; data: IEvent }>(
      `${this.eventsUrl}/${slug}`
    );
  }
  
  // --- Search and Filter Operations ---

  searchEvents(query: string): Observable<{ success: boolean; data: IEvent[] }> {
    const params = new HttpParams().set('q', query);
    return this.http.get<{ success: boolean; data: IEvent[] }>(
      `${this.eventsUrl}/search`, 
      { params }
    );
  }

  getEventsFiltered(params: EventsFilterParams): Observable<PaginatedResponse<IEvent>> {
    const httpParams = this.buildHttpParams(params);
    return this.http.get<PaginatedResponse<IEvent>>(this.eventsUrl, { params: httpParams });
  }

  getEventsByVenue(venueId: string): Observable<{ success: boolean; data: IEvent[] }> {
    const params = new HttpParams().set('venueId', venueId);
    return this.http.get<{ success: boolean; data: IEvent[] }>(this.eventsUrl, { params });
  }

  getEventsByVenueSlug(params: VenueSlugParams): Observable<PaginatedResponse<IEvent>> {
    const { venueSlug, ...queryParams } = params;
    const httpParams = this.buildHttpParams(queryParams);

    return this.http.get<PaginatedResponse<IEvent>>(
      `${this.eventsUrl}/venue/paginated/${venueSlug}`, 
      { params: httpParams }
    );
  }
}