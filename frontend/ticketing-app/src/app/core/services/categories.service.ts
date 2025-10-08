import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ICategory } from "../models/Categories.model";
import { environment } from "~/environments/environment"; 


@Injectable({ providedIn: 'root' })

export class CategoryService {

  private baseUrl = environment.apiUrl ?? 'http://localhost:3003';

  constructor(private http: HttpClient) {}

  /** Todas las categorías (opcionalmente incluyen subcategorías) */
  getAllCategories(): Observable<ICategory[]> {
    return this.http.get<ICategory[]>(`${this.baseUrl}/api/categories`);
  }

  /** Categorías disponibles (con eventos activos) -> ajusta la ruta a tu API */
  getAvailableCategories(): Observable<ICategory[]> {
    // si tu backend expone /api/categories/available:
    return this.http.get<ICategory[]>(`${this.baseUrl}/api/categories/available`);
  }

  /** Obtener una categoría concreta por id */
  getCategoryById(id: number): Observable<ICategory> {
    return this.http.get<ICategory>(`${this.baseUrl}/api/categories/${id}`);
  }

  //* Obtener una subcategoria */

  getSubcategories():Observable<ICategory[]>{
    return this.http.get<ICategory[]>(`${this.baseUrl}/api/categories/subcategories`);
  }
}
