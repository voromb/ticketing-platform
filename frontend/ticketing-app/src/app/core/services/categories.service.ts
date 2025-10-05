import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ICategory } from "../models/Categories.model";

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  
  private baseUrl = 'http://localhost:3003'; // base para las rutas de categorías

  constructor(private http: HttpClient) {}

  // Obtener todas las categorías (con subcategorías)
  getAllCategories(): Observable<ICategory[]> {
    return this.http.get<ICategory[]>(`${this.baseUrl}/api/categories`);
  }

  // Obtener solo las categorías disponibles (con eventos activos)
  getAvailableCategories(): Observable<ICategory[]> {
    return this.http.get<ICategory[]>(`${this.baseUrl}/api/categories/:id`);
  }
}
