import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MerchandisingService, Product } from '../../../services/merchandising.service';

@Component({
  selector: 'app-merchandising-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './merchandising-list.component.html',
  styles: []
})
export class MerchandisingListComponent implements OnInit {
  loading = true;
  products: Product[] = [];
  filteredProducts: Product[] = [];
  
  searchTerm = '';
  typeFilter = 'all';
  statusFilter = 'all';

  constructor(
    private merchandisingService: MerchandisingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.products = this.merchandisingService['getMockProducts']();
    this.filteredProducts = [...this.products];
    this.loading = false;
    
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
  }

  filterProducts(): void {
    this.filteredProducts = this.products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesType = this.typeFilter === 'all' || product.type === this.typeFilter;
      const matchesStatus = this.statusFilter === 'all' || product.status === this.statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }

  getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      'available': 'bg-green-100 text-green-800',
      'out_of_stock': 'bg-red-100 text-red-800',
      'coming_soon': 'bg-blue-100 text-blue-800',
      'discontinued': 'bg-gray-100 text-gray-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  getApprovalBadgeClass(status?: string): string {
    const classes: Record<string, string> = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'APPROVED': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-red-100 text-red-800'
    };
    return classes[status || ''] || 'bg-gray-100 text-gray-800';
  }
}
