import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TravelService, Trip } from '../../../services/travel.service';

@Component({
  selector: 'app-travel-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './travel-list.component.html',
  styleUrls: ['./travel-list.component.scss']
})
export class TravelListComponent implements OnInit {
  loading = true;
  trips: Trip[] = [];
  filteredTrips: Trip[] = [];
  
  // Filtros
  searchTerm = '';
  statusFilter = 'all';
  regionFilter = 'all';
  sortBy = 'name';
  sortOrder: 'asc' | 'desc' = 'asc';

  // Modal
  showModal = false;
  modalMode: 'create' | 'edit' | 'view' = 'create';
  selectedTrip: Partial<Trip> = {};

  // Paginación
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  constructor(
    private travelService: TravelService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadTrips();
  }

  loadTrips(): void {
    this.loading = true;
    
    this.travelService.getAll().subscribe({
      next: (response) => {
        this.trips = response.data || response;
        this.applyFilters();
        this.loading = false;
        
        setTimeout(() => {
          this.cdr.detectChanges();
        }, 100);
      },
      error: (error) => {
        console.error('Error cargando viajes:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.trips];

    // Búsqueda
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(term) ||
        t.departure.toLowerCase().includes(term) ||
        t.arrival.toLowerCase().includes(term) ||
        t.vehicleType.toLowerCase().includes(term)
      );
    }

    // Filtro por estado
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(t => t.approvalStatus === this.statusFilter);
    }

    // Filtro por región
    if (this.regionFilter !== 'all') {
      filtered = filtered.filter(t => t.region === this.regionFilter);
    }

    // Ordenar
    filtered.sort((a, b) => {
      let aValue: any = a[this.sortBy as keyof Trip];
      let bValue: any = b[this.sortBy as keyof Trip];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) return this.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    this.filteredTrips = filtered;
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  getPaginatedTrips(): Trip[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredTrips.slice(start, end);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  toggleSort(field: string): void {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = 'asc';
    }
    this.applyFilters();
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.selectedTrip = {
      name: '',
      description: '',
      departure: '',
      arrival: '',
      vehicleType: 'BUS',
      capacity: 0,
      price: 0,
      bookedSeats: 0,
      status: 'SCHEDULED',
      isActive: true
    };
    this.showModal = true;
  }

  openEditModal(trip: Trip): void {
    this.modalMode = 'edit';
    this.selectedTrip = { ...trip };
    this.showModal = true;
  }

  openViewModal(trip: Trip): void {
    this.modalMode = 'view';
    this.selectedTrip = { ...trip };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedTrip = {};
  }

  saveTrip(): void {
    if (this.modalMode === 'create') {
      this.travelService.create(this.selectedTrip).subscribe({
        next: () => {
          this.loadTrips();
          this.closeModal();
        },
        error: (error) => console.error('Error creando viaje:', error)
      });
    } else if (this.modalMode === 'edit' && this.selectedTrip._id) {
      this.travelService.update(this.selectedTrip._id, this.selectedTrip).subscribe({
        next: () => {
          this.loadTrips();
          this.closeModal();
        },
        error: (error) => console.error('Error actualizando viaje:', error)
      });
    }
  }

  deleteTrip(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este viaje?')) {
      this.travelService.delete(id).subscribe({
        next: () => this.loadTrips(),
        error: (error) => console.error('Error eliminando viaje:', error)
      });
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getOccupancyPercentage(trip: Trip): number {
    if (trip.capacity === 0) return 0;
    return Math.round((trip.bookedSeats / trip.capacity) * 100);
  }

  getOccupancyColor(percentage: number): string {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-blue-500';
  }
}
