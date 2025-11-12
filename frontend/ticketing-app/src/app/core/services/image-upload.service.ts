import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UploadResponse {
  message: string;
  images: string[];
  count: number;
}

export interface DeleteImageRequest {
  imageUrl: string;
}

export interface DeleteMultipleImagesRequest {
  imageUrls: string[];
}

@Injectable({
  providedIn: 'root',
})
export class ImageUploadService {
  // Upload siempre va a festival-services
  private apiUrl = environment.festivalApiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Sube múltiples imágenes para eventos
   */
  uploadEventImages(files: File[]): Observable<UploadResponse> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file, file.name);
    });

    const token = localStorage.getItem('adminToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    // ✅ CORREGIDO: Sin /api/ extra
    return this.http.post<UploadResponse>(`${this.apiUrl}/upload/events`, formData, {
      headers,
    });
  }

  /**
   * Sube múltiples imágenes para venues
   */
  uploadVenueImages(files: File[]): Observable<UploadResponse> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file, file.name);
    });

    const token = localStorage.getItem('adminToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    // ✅ CORREGIDO: Sin /api/ extra
    return this.http.post<UploadResponse>(`${this.apiUrl}/upload/venues`, formData, {
      headers,
    });
  }

  /**
   * Sube múltiples imágenes para categorías
   */
  uploadCategoryImages(files: File[]): Observable<UploadResponse> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file, file.name);
    });

    const token = localStorage.getItem('adminToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    // ✅ CORREGIDO: Sin /api/ extra
    return this.http.post<UploadResponse>(`${this.apiUrl}/upload/categories`, formData, {
      headers,
    });
  }

  /**
   * Sube múltiples imágenes para subcategorías
   */
  uploadSubcategoryImages(files: File[]): Observable<UploadResponse> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file, file.name);
    });

    const token = localStorage.getItem('adminToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    // ✅ CORREGIDO: Sin /api/ extra
    return this.http.post<UploadResponse>(`${this.apiUrl}/upload/subcategories`, formData, {
      headers,
    });
  }

  /**
   * Sube múltiples imágenes para productos de merchandising
   */
  uploadProductImages(files: File[]): Observable<UploadResponse> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file, file.name);
    });

    const token = localStorage.getItem('adminToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post<UploadResponse>(`${this.apiUrl}/upload/products`, formData, {
      headers,
    });
  }

  /**
   * Elimina una imagen del servidor
   */
  deleteImage(imageUrl: string): Observable<{ message: string }> {
    const token = localStorage.getItem('adminToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    // ✅ CORREGIDO: Sin /api/ extra
    return this.http.request<{ message: string }>('delete', `${this.apiUrl}/upload`, {
      headers,
      body: { imageUrl },
    });
  }

  /**
   * Elimina múltiples imágenes del servidor
   */
  deleteMultipleImages(imageUrls: string[]): Observable<{ message: string; count: number }> {
    const token = localStorage.getItem('adminToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    // ✅ CORREGIDO: Sin /api/ extra
    return this.http.post<{ message: string; count: number }>(
      `${this.apiUrl}/upload/delete-multiple`,
      { imageUrls },
      { headers }
    );
  }
}
