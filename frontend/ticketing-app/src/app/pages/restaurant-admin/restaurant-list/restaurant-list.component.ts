import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RestaurantService, Restaurant } from '../../../services/restaurant.service';

@Component({
  selector: 'app-restaurant-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './restaurant-list.component.html',
  styleUrls: ['./restaurant-list.component.scss']
})
export class RestaurantListComponent implements OnInit {
  loading = true;
  restaurants: Restaurant[] = [];
  filteredRestaurants: Restaurant[] = [];
  
  // Filtros
  searchTerm = '';
  statusFilter = 'all';
  regionFilter = 'all';
  sortBy = 'name';
  sortOrder: 'asc' | 'desc' = 'asc';

  // Modal
  showModal = false;
  modalMode: 'create' | 'edit' | 'view' = 'create';
  selectedRestaurant: Partial<Restaurant> = {};

  // Paginación
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  constructor(
    private restaurantService: RestaurantService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadRestaurants();
  }

  loadRestaurants(): void {
    this.loading = true;
    
    this.restaurantService.getAll().subscribe({
      next: (response) => {
        this.restaurants = response.data || response;
        this.applyFilters();
        this.loading = false;
        
        setTimeout(() => {
          this.cdr.detectChanges();
        }, 100);
      },
      error: (error) => {
        console.error('Error cargando restaurantes:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.restaurants];

    // Búsqueda
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(term) ||
        r.cuisine.toLowerCase().includes(term) ||
        r.location.toLowerCase().includes(term)
      );
    }

    // Filtro por estado
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(r => r.approvalStatus === this.statusFilter);
    }

    // Filtro por región
    if (this.regionFilter !== 'all') {
      filtered = filtered.filter(r => r.region === this.regionFilter);
    }

    // Ordenar
    filtered.sort((a, b) => {
      let aValue: any = a[this.sortBy as keyof Restaurant];
      let bValue: any = b[this.sortBy as keyof Restaurant];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) return this.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    this.filteredRestaurants = filtered;
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  getPaginatedRestaurants(): Restaurant[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredRestaurants.slice(start, end);
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
    this.selectedRestaurant = {
      name: '',
      description: '',
      cuisine: '',
      location: '',
      capacity: 0,
      currentOccupancy: 0,
      acceptsReservations: true,
      reservationDurationMinutes: 60,
      status: 'OPEN',
      isActive: true,
      schedule: [],
      menu: []
    };
    this.showModal = true;
  }

  openEditModal(restaurant: Restaurant): void {
    this.modalMode = 'edit';
    this.selectedRestaurant = { ...restaurant };
    this.showModal = true;
  }

  openViewModal(restaurant: Restaurant): void {
    this.modalMode = 'view';
    this.selectedRestaurant = { ...restaurant };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedRestaurant = {};
  }

  saveRestaurant(): void {
    if (this.modalMode === 'create') {
      this.restaurantService.create(this.selectedRestaurant).subscribe({
        next: () => {
          this.loadRestaurants();
          this.closeModal();
        },
        error: (error) => console.error('Error creando restaurante:', error)
      });
    } else if (this.modalMode === 'edit' && this.selectedRestaurant._id) {
      this.restaurantService.update(this.selectedRestaurant._id, this.selectedRestaurant).subscribe({
        next: () => {
          this.loadRestaurants();
          this.closeModal();
        },
        error: (error) => console.error('Error actualizando restaurante:', error)
      });
    }
  }

  deleteRestaurant(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este restaurante?')) {
      this.restaurantService.delete(id).subscribe({
        next: () => this.loadRestaurants(),
        error: (error) => console.error('Error eliminando restaurante:', error)
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

  getStatusIcon(status: string): string {
    switch (status) {
      case 'OPEN': return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'CLOSED': return 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z';
      default: return 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  }

  getOccupancyPercentage(restaurant: Restaurant): number {
    if (restaurant.capacity === 0) return 0;
    return Math.round((restaurant.currentOccupancy / restaurant.capacity) * 100);
  }

  getOccupancyColor(percentage: number): string {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  }
}
