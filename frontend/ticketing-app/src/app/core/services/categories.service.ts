import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ICategory } from '../models/Categories.model';
import { environment } from '~/environments/environment';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private baseUrl = environment.apiUrl ?? 'http://localhost:3003';

  constructor(private http: HttpClient) {}

  /** 🔹 Obtiene todas las categorías (con subcategorías) */
  getAllCategories(): Observable<ICategory[]> {
    return this.http
      .get<{ success: boolean; data: ICategory[] }>(`${this.baseUrl}/categories`)
      .pipe(
        map((res) => {
          console.log('📦 Categorías API:', res); // 🔍 para depurar
          return res.data ?? [];
        })
      );
  }
}
