import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RestaurantService, Restaurant, RestaurantStats } from '../../../core/services_enterprise/restaurant.service';

@Component({
  selector: 'app-restaurant-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './restaurant-dashboard.component.html',
  styles: []
})
export class RestaurantDashboardComponent implements OnInit {
  loading = true;
  restaurants: Restaurant[] = [];
  stats: RestaurantStats = {
    total: 0,
    active: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    byRegion: {}
  };

  recentActivity: any[] = [];

  constructor(
    private restaurantService: RestaurantService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    
    this.restaurantService.getAll().subscribe({
      next: (response) => {
        this.restaurants = response.data || response;
        this.stats = this.restaurantService.calculateStats(this.restaurants);
        this.generateRecentActivity();
        this.loading = false;
        
        setTimeout(() => {
          this.cdr.detectChanges();
        }, 100);
      },
      error: (error) => {
        console.error('Error cargando datos:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  generateRecentActivity(): void {
    // Generar actividad reciente basada en los restaurantes
    this.recentActivity = this.restaurants
      .slice(0, 5)
      .map(r => ({
        type: 'restaurant',
        action: r.approvalStatus === 'PENDING' ? 'Pendiente de aprobación' : 'Actualizado',
        name: r.name,
        time: this.getRelativeTime(r.updatedAt || r.createdAt),
        status: r.approvalStatus
      }));
  }

  getRelativeTime(date: any): string {
    if (!date) return 'Hace un momento';
    const now = new Date().getTime();
    const then = new Date(date).getTime();
    const diff = Math.floor((now - then) / 1000 / 60); // minutos
    
    if (diff < 1) return 'Hace un momento';
    if (diff < 60) return `Hace ${diff} minutos`;
    if (diff < 1440) return `Hace ${Math.floor(diff / 60)} horas`;
    return `Hace ${Math.floor(diff / 1440)} días`;
  }

  getOccupancyPercentage(): number {
    if (this.restaurants.length === 0) return 0;
    const totalCapacity = this.restaurants.reduce((sum, r) => sum + r.capacity, 0);
    const totalOccupancy = this.restaurants.reduce((sum, r) => sum + r.currentOccupancy, 0);
    return totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0;
  }

  getAverageRating(): number {
    const rated = this.restaurants.filter(r => r.rating && r.rating > 0);
    if (rated.length === 0) return 0;
    const sum = rated.reduce((acc, r) => acc + (r.rating || 0), 0);
    return Math.round((sum / rated.length) * 10) / 10;
  }

  getTotalReviews(): number {
    return this.restaurants.reduce((sum, r) => sum + (r.totalReviews || 0), 0);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      case 'APPROVED': return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'REJECTED': return 'bg-red-500/20 text-red-400 border border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  }
}
