import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Venue } from '../models/Venue.model';

export interface Pagination {
  total: number;
  page: number;
  limit: number;
}

export interface VenuesResponse {
  venues: Venue[];
  pagination: Pagination;
}

@Injectable({
  providedIn: 'root'
})
export class VenuesService {
  private baseUrl = 'http://localhost:3003'; 

  constructor(private http: HttpClient) {}

  getActiveVenues(page: number = 1, limit: number = 10): Observable<VenuesResponse> {
    const params = new HttpParams()
      .set('isActive', 'true') // ✅ si tu API lo requiere
      .set('page', page.toString()) // ✅ convertir a string
      .set('limit', limit.toString()); // ✅ convertir a string
    
    return this.http.get<VenuesResponse>(`${this.baseUrl}/api/venues`, { params });
  }
  getVenueById(slug: string): Observable<Venue> {
  return this.http.get<Venue>(`${this.baseUrl}/api/venues/${slug}`);
}
}
