import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TravelService, Trip, TripStats } from '../../../core/services_enterprise/travel.service';

@Component({
  selector: 'app-travel-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './travel-dashboard.component.html',
  styles: []
})
export class TravelDashboardComponent implements OnInit {
  loading = true;
  trips: Trip[] = [];
  stats: TripStats = {
    total: 0,
    active: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    byRegion: {}
  };

  recentActivity: any[] = [];

  constructor(
    private travelService: TravelService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    
    this.travelService.getAll().subscribe({
      next: (response) => {
        this.trips = response.data || response;
        this.stats = this.travelService.calculateStats(this.trips);
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
    this.recentActivity = this.trips
      .slice(0, 5)
      .map(t => ({
        type: 'trip',
        action: t.approvalStatus === 'PENDING' ? 'Pendiente de aprobación' : 'Actualizado',
        name: t.name,
        time: this.getRelativeTime(t.updatedAt || t.createdAt),
        status: t.approvalStatus
      }));
  }

  getRelativeTime(date: any): string {
    if (!date) return 'Hace un momento';
    const now = new Date().getTime();
    const then = new Date(date).getTime();
    const diff = Math.floor((now - then) / 1000 / 60);
    
    if (diff < 1) return 'Hace un momento';
    if (diff < 60) return `Hace ${diff} minutos`;
    if (diff < 1440) return `Hace ${Math.floor(diff / 60)} horas`;
    return `Hace ${Math.floor(diff / 1440)} días`;
  }

  getOccupancyPercentage(): number {
    if (this.trips.length === 0) return 0;
    const totalCapacity = this.trips.reduce((sum, t) => sum + t.capacity, 0);
    const totalBooked = this.trips.reduce((sum, t) => sum + t.bookedSeats, 0);
    return totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0;
  }

  getAveragePrice(): number {
    if (this.trips.length === 0) return 0;
    const sum = this.trips.reduce((acc, t) => acc + t.price, 0);
    return Math.round(sum / this.trips.length);
  }

  getTotalRevenue(): number {
    return this.trips.reduce((sum, t) => sum + (t.bookedSeats * t.price), 0);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
