import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MerchandisingService, ProductStats } from '../../../core/services_enterprise/merchandising.service';

@Component({
  selector: 'app-merchandising-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './merchandising-dashboard.component.html',
  styles: []
})
export class MerchandisingDashboardComponent implements OnInit {
  loading = true;
  stats: ProductStats = {
    totalProducts: 0,
    activeProducts: 0,
    totalStock: 0,
    availableStock: 0,
    soldUnits: 0,
    totalRevenue: 0,
    pendingApproval: 0,
    approved: 0,
    byType: { clothing: 0, accessory: 0, vinyl: 0, cd: 0, poster: 0, other: 0 },
    byStatus: { available: 0, out_of_stock: 0, coming_soon: 0, discontinued: 0 }
  };

  constructor(
    private merchandisingService: MerchandisingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.cdr.markForCheck();
    
    this.merchandisingService.getProductStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading = false;
        this.cdr.markForCheck();
        
        // Forzar detección de cambios adicional después de un momento
        setTimeout(() => {
          this.cdr.detectChanges();
        }, 100);
      },
      error: (error) => {
        console.error('Error cargando estadísticas:', error);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
