import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { ICategory } from '../models/Categories.model';
import { environment } from '~/environments/environment';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /** 🔹 Obtiene todas las categorías (con subcategorías) */
  getAllCategories(): Observable<ICategory[]> {
    return this.http
      .get<{ success: boolean; data: ICategory[] } | ICategory[]>(`${this.baseUrl}/categories`)
      .pipe(
        map((res) => {
          console.log('📦 Categorías API - Respuesta completa:', res); // 🔍 para depurar
          
          // Si la respuesta es null o undefined
          if (!res) {
            console.warn('⚠️ La respuesta de la API es null o undefined');
            return [];
          }
          
          // Si la respuesta es directamente un array (caso alternativo)
          if (Array.isArray(res)) {
            console.log('📦 La respuesta es un array directo:', res);
            return res;
          }
          
          // Si la respuesta tiene la estructura { success, data }
          if ('success' in res && 'data' in res) {
            if (!res.success) {
              console.warn('⚠️ La API devolvió success: false');
              return [];
            }
            return res.data ?? [];
          }
          
          // Caso por defecto
          console.warn('⚠️ Estructura de respuesta desconocida:', res);
          return [];
        }),
        catchError((error) => {
          console.error('❌ Error al obtener categorías:', error);
          console.error('❌ URL intentada:', `${this.baseUrl}/categories`);
          console.error('❌ Detalles del error:', {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            error: error.error
          });
          return of([]); // Retorna un array vacío en caso de error
        })
      );
  }
}
