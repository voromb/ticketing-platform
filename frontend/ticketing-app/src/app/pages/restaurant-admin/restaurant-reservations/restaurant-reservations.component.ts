import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Reservation {
  _id: string;
  restaurantId: string;
  restaurantName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  time: string;
  numberOfPeople: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  specialRequests?: string;
  createdAt: string;
}

@Component({
  selector: 'app-restaurant-reservations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './restaurant-reservations.component.html',
  styles: []
})
export class RestaurantReservationsComponent implements OnInit {
  loading = true;
  reservations: Reservation[] = [];
  filteredReservations: Reservation[] = [];
  paginatedReservations: Reservation[] = [];

  // Filtros
  searchTerm = '';
  statusFilter = 'all';
  dateFilter = '';

  // Paginación
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  Math = Math;

  // Modal
  showCreateModal = false;
  reservationForm: Partial<Reservation> = {
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    date: '',
    time: '',
    numberOfPeople: 2,
    status: 'PENDING',
    specialRequests: ''
  };

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.loading = true;
    
    // TODO: Conectar con servicio real de reservas
    // this.reservationService.getAll().subscribe({
    //   next: (response) => {
    //     this.reservations = response.data || response;
    //     this.applyFilters();
    //     this.loading = false;
    //     
    //     setTimeout(() => {
    //       this.cdr.detectChanges();
    //     }, 100);
    //   },
    //   error: (error) => {
    //     console.error('Error cargando reservas:', error);
    //     this.loading = false;
    //     this.cdr.detectChanges();
    //   }
    // });

    // Por ahora, sin datos
    this.reservations = [];
    this.applyFilters();
    this.loading = false;
    
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
  }

  applyFilters(): void {
    let filtered = [...this.reservations];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.customerName.toLowerCase().includes(term) ||
        r.customerEmail.toLowerCase().includes(term) ||
        r.restaurantName.toLowerCase().includes(term)
      );
    }

    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === this.statusFilter);
    }

    if (this.dateFilter) {
      filtered = filtered.filter(r => r.date === this.dateFilter);
    }

    this.filteredReservations = filtered;
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredReservations.length / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedReservations = this.filteredReservations.slice(startIndex, endIndex);
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

  openCreateModal(): void {
    this.reservationForm = {
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      date: '',
      time: '',
      numberOfPeople: 2,
      status: 'CONFIRMED',
      specialRequests: ''
    };
    this.showCreateModal = true;
  }

  closeModal(): void {
    this.showCreateModal = false;
  }

  createReservation(): void {
    // TODO: Conectar con servicio real
    // this.reservationService.create(this.reservationForm).subscribe({
    //   next: () => {
    //     this.loadReservations();
    //     this.closeModal();
    //   },
    //   error: (error) => console.error('Error creando reserva:', error)
    // });
    
    console.log('Crear reserva (pendiente de implementar servicio):', this.reservationForm);
    this.closeModal();
  }

  updateStatus(reservation: Reservation, newStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'): void {
    // TODO: Conectar con servicio real
    // this.reservationService.updateStatus(reservation._id, newStatus).subscribe({
    //   next: () => {
    //     reservation.status = newStatus;
    //     this.cdr.detectChanges();
    //   },
    //   error: (error) => console.error('Error actualizando estado:', error)
    // });
    
    console.log('Actualizar estado (pendiente de implementar servicio):', reservation._id, newStatus);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      case 'CONFIRMED': return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'CANCELLED': return 'bg-red-500/20 text-red-400 border border-red-500/30';
      case 'COMPLETED': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'PENDING': return 'Pendiente';
      case 'CONFIRMED': return 'Confirmada';
      case 'CANCELLED': return 'Cancelada';
      case 'COMPLETED': return 'Completada';
      default: return status;
    }
  }
}
