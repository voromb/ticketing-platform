
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CarouselHome, CarouselDetails } from '../models/Carousel.model';

@Injectable({
  providedIn: 'root'
})
export class CarouselService {

  constructor(private http: HttpClient) { } 

  getCarouselHome(): Observable<CarouselHome[]> {
    return this.http.get<CarouselHome[]>(`/carousel/`);
  }

  getCarouselDetails(slug: string | null): Observable<CarouselDetails[]> {
    return this.http.get<CarouselDetails[]>(`/carousel/${slug}`);
  }

}