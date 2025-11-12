import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Product {
  _id: string;
  festivalId: string;
  bandId?: string;
  bandName?: string;
  name: string;
  description: string;
  type: 'TSHIRT' | 'HOODIE' | 'VINYL' | 'CD' | 'POSTER' | 'ACCESSORIES' | 'OTHER';
  price: number;
  sizes?: string[];
  images: string[];
  stock: {
    total: number;
    available: number;
    reserved: number;
  };
  soldUnits: number;
  exclusive: boolean;
  preOrderEnabled: boolean;
  releaseDate?: Date;
  status: 'available' | 'out_of_stock' | 'coming_soon' | 'discontinued';
  isActive: boolean;
  companyId?: string;
  companyName?: string;
  region?: string;
  managedBy?: string;
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  lastModifiedBy?: string;
  lastApprovedBy?: string;
  lastApprovedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  totalStock: number;
  availableStock: number;
  soldUnits: number;
  totalRevenue: number;
  pendingApproval: number;
  approved: number;
  byType: {
    clothing: number;
    accessory: number;
    vinyl: number;
    cd: number;
    poster: number;
    other: number;
  };
  byStatus: {
    available: number;
    out_of_stock: number;
    coming_soon: number;
    discontinued: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class MerchandisingService {
  private apiUrl = `${environment.festivalApiUrl}/merchandising`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // ==================== CRUD PRODUCTS ====================

  getProducts(festivalId?: string, bandId?: string): Observable<Product[]> {
    let url = this.apiUrl;
    const params: string[] = [];
    
    if (festivalId) params.push(`festivalId=${festivalId}`);
    if (bandId) params.push(`bandId=${bandId}`);
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    return this.http.get<Product[]>(url);
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  createProduct(product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product, {
      headers: this.getAuthHeaders()
    });
  }

  updateProduct(id: string, product: Partial<Product>): Observable<Product> {
    return this.http.patch<Product>(`${this.apiUrl}/${id}`, product, {
      headers: this.getAuthHeaders()
    });
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // ==================== STOCK MANAGEMENT ====================

  reserveStock(id: string, quantity: number): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/${id}/reserve`, { quantity }, {
      headers: this.getAuthHeaders()
    });
  }

  confirmPurchase(id: string, quantity: number): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/${id}/confirm`, { quantity }, {
      headers: this.getAuthHeaders()
    });
  }

  releaseStock(id: string, quantity: number): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/${id}/release`, { quantity }, {
      headers: this.getAuthHeaders()
    });
  }

  // ==================== STATISTICS ====================

  getProductStats(): Observable<ProductStats> {
    return this.http.get<ProductStats>(`${this.apiUrl}/stats`);
  }
}
