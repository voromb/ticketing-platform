import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TravelService, Trip } from '../../../core/services_enterprise/travel.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-travel-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './travel-list.component.html',
  styles: []
})
export class TravelListComponent implements OnInit {
  loading = true;
  trips: Trip[] = [];
  filteredTrips: Trip[] = [];
  paginatedTrips: Trip[] = [];
  
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
  pageSize = 10;
  totalPages = 0;
  Math = Math;

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
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredTrips.length / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedTrips = this.filteredTrips.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  goToFirstPage(): void {
    this.goToPage(1);
  }

  goToLastPage(): void {
    this.goToPage(this.totalPages);
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const current = this.currentPage;
    const total = this.totalPages;
    
    if (total > 0) {
      pages.push(1);
    }
    
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }
    
    if (total > 1 && !pages.includes(total)) {
      pages.push(total);
    }
    
    return pages.sort((a, b) => a - b);
  }
  
  showEllipsisBefore(page: number): boolean {
    const pages = this.pageNumbers;
    const index = pages.indexOf(page);
    return index > 0 && pages[index] - pages[index - 1] > 1;
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
      // Transformar datos para que coincidan con el DTO del backend
      const tripData: any = {
        ...this.selectedTrip,
        festivalId: 'default-festival', // TODO: Obtener del contexto
        departure: {
          location: this.selectedTrip.departure,
          datetime: this.selectedTrip.departureTime || new Date()
        },
        arrival: {
          location: this.selectedTrip.arrival,
          datetime: this.selectedTrip.arrivalTime || new Date()
        }
      };
      
      this.travelService.create(tripData).subscribe({
        next: () => {
          this.loadTrips();
          this.closeModal();
          // SweetAlert de éxito
          Swal.fire({
            icon: 'success',
            title: '¡Viaje creado!',
            text: 'El viaje ha sido creado exitosamente y está pendiente de aprobación.',
            confirmButtonColor: '#3b82f6',
            timer: 3000
          });
        },
        error: (error) => {
          console.error('Error creando viaje:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo crear el viaje. Inténtalo de nuevo.',
            confirmButtonColor: '#ef4444'
          });
        }
      });
    } else if (this.modalMode === 'edit' && this.selectedTrip._id) {
      // Transformar datos para edición
      const tripData: any = {
        ...this.selectedTrip,
        departure: typeof this.selectedTrip.departure === 'string' 
          ? { location: this.selectedTrip.departure }
          : this.selectedTrip.departure,
        arrival: typeof this.selectedTrip.arrival === 'string'
          ? { location: this.selectedTrip.arrival }
          : this.selectedTrip.arrival
      };
      
      this.travelService.update(this.selectedTrip._id, tripData).subscribe({
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
