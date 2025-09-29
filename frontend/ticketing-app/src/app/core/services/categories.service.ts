import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Category } from "../models/Categories.model";


@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  constructor(private http: HttpClient) { }

  all_categories(params: any): Observable<Category[]> {
    return this.http.get<Category[]>('/categories/_id_cat');
  }

  all_categories_select(): Observable<Category[]> {
    return this.http.get<Category[]>(`/categories`)
  }
}