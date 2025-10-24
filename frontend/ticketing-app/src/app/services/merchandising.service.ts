import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  _id: string;
  festivalId: string;
  bandId?: string;
  bandName?: string;
  name: string;
  description: string;
  type: 'clothing' | 'accessory' | 'vinyl' | 'cd' | 'poster' | 'other';
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
  private apiUrl = 'http://localhost:3004/api/merchandising';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
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

  getProductStats(): ProductStats {
    // Mock data - en producción vendría del backend
    const products = this.getMockProducts();
    
    return {
      totalProducts: products.length,
      activeProducts: products.filter(p => p.isActive).length,
      totalStock: products.reduce((sum, p) => sum + p.stock.total, 0),
      availableStock: products.reduce((sum, p) => sum + p.stock.available, 0),
      soldUnits: products.reduce((sum, p) => sum + p.soldUnits, 0),
      totalRevenue: products.reduce((sum, p) => sum + (p.soldUnits * p.price), 0),
      pendingApproval: products.filter(p => p.approvalStatus === 'PENDING').length,
      approved: products.filter(p => p.approvalStatus === 'APPROVED').length,
      byType: {
        clothing: products.filter(p => p.type === 'clothing').length,
        accessory: products.filter(p => p.type === 'accessory').length,
        vinyl: products.filter(p => p.type === 'vinyl').length,
        cd: products.filter(p => p.type === 'cd').length,
        poster: products.filter(p => p.type === 'poster').length,
        other: products.filter(p => p.type === 'other').length,
      },
      byStatus: {
        available: products.filter(p => p.status === 'available').length,
        out_of_stock: products.filter(p => p.status === 'out_of_stock').length,
        coming_soon: products.filter(p => p.status === 'coming_soon').length,
        discontinued: products.filter(p => p.status === 'discontinued').length,
      }
    };
  }

  // ==================== MOCK DATA ====================

  private getMockProducts(): Product[] {
    return [
      {
        _id: '1',
        festivalId: 'fest1',
        bandId: 'band1',
        bandName: 'Metallica',
        name: 'Camiseta Master of Puppets',
        description: 'Camiseta oficial de la gira 2025',
        type: 'clothing',
        price: 29.99,
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        images: ['https://via.placeholder.com/300'],
        stock: { total: 500, available: 350, reserved: 50 },
        soldUnits: 100,
        exclusive: false,
        preOrderEnabled: false,
        status: 'available',
        isActive: true,
        companyId: 'comp1',
        companyName: 'España Merchandising',
        region: 'España',
        managedBy: 'admin.spain.merch@festival.com',
        approvalStatus: 'APPROVED',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: '2',
        festivalId: 'fest1',
        bandId: 'band2',
        bandName: 'Iron Maiden',
        name: 'Vinilo The Number of the Beast',
        description: 'Edición limitada remasterizada',
        type: 'vinyl',
        price: 34.99,
        images: ['https://via.placeholder.com/300'],
        stock: { total: 200, available: 45, reserved: 5 },
        soldUnits: 150,
        exclusive: true,
        preOrderEnabled: false,
        status: 'available',
        isActive: true,
        companyId: 'comp2',
        companyName: 'Europa Merchandising',
        region: 'Europa',
        managedBy: 'admin.europe.merch@festival.com',
        approvalStatus: 'APPROVED',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: '3',
        festivalId: 'fest1',
        bandId: 'band3',
        bandName: 'Slayer',
        name: 'Poster Reign in Blood',
        description: 'Poster oficial 60x90cm',
        type: 'poster',
        price: 15.99,
        images: ['https://via.placeholder.com/300'],
        stock: { total: 300, available: 280, reserved: 10 },
        soldUnits: 10,
        exclusive: false,
        preOrderEnabled: false,
        status: 'available',
        isActive: true,
        companyId: 'comp1',
        companyName: 'España Merchandising',
        region: 'España',
        managedBy: 'admin.spain.merch@festival.com',
        approvalStatus: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: '4',
        festivalId: 'fest1',
        name: 'Gorra Festival Rock 2025',
        description: 'Gorra oficial del festival',
        type: 'accessory',
        price: 19.99,
        images: ['https://via.placeholder.com/300'],
        stock: { total: 0, available: 0, reserved: 0 },
        soldUnits: 400,
        exclusive: false,
        preOrderEnabled: false,
        status: 'out_of_stock',
        isActive: true,
        companyId: 'comp1',
        companyName: 'España Merchandising',
        region: 'España',
        managedBy: 'admin.spain.merch@festival.com',
        approvalStatus: 'APPROVED',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }
}
