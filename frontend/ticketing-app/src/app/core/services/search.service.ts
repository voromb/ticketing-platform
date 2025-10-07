import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private products = [
    'Laptop',
    'Laptop gamer',
    'Auriculares',
    'Mouse inalámbrico',
    'Monitor 4K',
    'Teclado mecánico',
    'Cámara réflex',
    'Smartphone',
    'Tablet'
  ];

  constructor() {}

  getSuggestions(query: string): Observable<string[]> {
    const filtered = this.products.filter(p => p.toLowerCase().includes(query.toLowerCase()));
    return of(filtered);
  }
}
