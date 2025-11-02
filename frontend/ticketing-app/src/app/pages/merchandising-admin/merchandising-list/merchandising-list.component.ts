import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MerchandisingService, Product } from '../../../services/merchandising.service';
import { ImageUploadComponent } from '../../../shared/components/image-upload/image-upload.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-merchandising-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageUploadComponent],
  templateUrl: './merchandising-list.component.html',
  styles: []
})
export class MerchandisingListComponent implements OnInit {
  loading = true;
  products: Product[] = [];
  filteredProducts: Product[] = [];
  paginatedProducts: Product[] = [];
  
  searchTerm = '';
  typeFilter = 'all';
  statusFilter = 'all';
  
  // Paginación
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  Math = Math; // Para usar Math.min en el template

  // Modal states
  showCreateModal = false;
  showEditModal = false;
  showDetailsModal = false;
  showDeleteModal = false;
  selectedProduct: Product | null = null;

  // Form data
  productForm: Partial<Product> = {
    name: '',
    description: '',
    type: 'TSHIRT',
    price: 0,
    stock: { total: 0, available: 0, reserved: 0 },
    images: ['https://via.placeholder.com/300'],
    status: 'available',
    approvalStatus: 'PENDING'
  };

  constructor(
    private merchandisingService: MerchandisingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.merchandisingService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.filteredProducts = [...this.products];
        this.updatePagination();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error cargando productos:', error);
        this.loading = false;
        alert('Error al cargar productos');
      }
    });
  }

  filterProducts(): void {
    this.filteredProducts = this.products.filter(product => {
      const matchesSearch = !this.searchTerm || 
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (product.bandName && product.bandName.toLowerCase().includes(this.searchTerm.toLowerCase()));
      const matchesType = this.typeFilter === 'all' || product.type === this.typeFilter;
      const matchesStatus = this.statusFilter === 'all' || product.status === this.statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
    
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredProducts.length / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedProducts = this.filteredProducts.slice(startIndex, endIndex);
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

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const current = this.currentPage;
    const total = this.totalPages;
    
    // Siempre mostrar primera página
    if (total > 0) {
      pages.push(1);
    }
    
    // Mostrar páginas alrededor de la actual
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }
    
    // Siempre mostrar última página
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
  
  goToFirstPage(): void {
    this.goToPage(1);
  }
  
  goToLastPage(): void {
    this.goToPage(this.totalPages);
  }

  // CRUD Operations
  openCreateModal(): void {
    this.productForm = {
      name: '',
      description: '',
      type: 'TSHIRT',
      price: 0,
      stock: { total: 100, available: 100, reserved: 0 },
      images: ['https://via.placeholder.com/150'],
      status: 'available',
      approvalStatus: 'PENDING'
    };
    this.showCreateModal = true;
  }

  openEditModal(product: Product): void {
    this.selectedProduct = product;
    this.productForm = { ...product };
    this.showEditModal = true;
  }

  openDetailsModal(product: Product): void {
    this.selectedProduct = product;
    this.showDetailsModal = true;
  }

  openDeleteModal(product: Product): void {
    this.selectedProduct = product;
    this.showDeleteModal = true;
  }

  closeModals(): void {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.showDetailsModal = false;
    this.showDeleteModal = false;
    this.selectedProduct = null;
  }

  createProduct(): void {
    this.merchandisingService.createProduct(this.productForm).subscribe({
      next: (product) => {
        this.loadProducts();
        this.closeModals();
        Swal.fire({
          icon: 'info',
          title: '¡Producto enviado!',
          text: 'Tu producto ha sido enviado para aprobación. Recibirás una notificación cuando sea revisado.',
          confirmButtonColor: '#8b5cf6',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (error) => {
        console.error('Error creando producto:', error);
        alert('Error al crear producto: ' + (error.error?.message || 'Error desconocido'));
      }
    });
  }

  updateProduct(): void {
    if (this.selectedProduct) {
      this.merchandisingService.updateProduct(this.selectedProduct._id, this.productForm).subscribe({
        next: (product) => {
          this.loadProducts();
          this.closeModals();
          alert('Producto actualizado exitosamente');
        },
        error: (error) => {
          console.error('Error actualizando producto:', error);
          alert('Error al actualizar producto: ' + (error.error?.message || 'Error desconocido'));
        }
      });
    }
  }

  deleteProduct(): void {
    if (this.selectedProduct) {
      this.merchandisingService.deleteProduct(this.selectedProduct._id).subscribe({
        next: () => {
          this.loadProducts();
          this.closeModals();
          alert('Producto eliminado exitosamente');
        },
        error: (error) => {
          console.error('Error eliminando producto:', error);
          alert('Error al eliminar producto: ' + (error.error?.message || 'Error desconocido'));
        }
      });
    }
  }

  getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      'available': 'bg-green-500/20 text-green-400 border border-green-500/30',
      'out_of_stock': 'bg-red-500/20 text-red-400 border border-red-500/30',
      'coming_soon': 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      'discontinued': 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
    };
    return classes[status] || 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
  }

  getApprovalBadgeClass(status?: string): string {
    const classes: Record<string, string> = {
      'PENDING': 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      'APPROVED': 'bg-green-500/20 text-green-400 border border-green-500/30',
      'REJECTED': 'bg-red-500/20 text-red-400 border border-red-500/30'
    };
    return classes[status || ''] || 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
  }

  getApprovalText(status?: string): string {
    const texts: Record<string, string> = {
      'PENDING': 'Pendiente',
      'APPROVED': 'Aprobado',
      'REJECTED': 'Rechazado'
    };
    return texts[status || ''] || 'N/A';
  }

  onImagesUploaded(images: string[]): void {
    console.log('📸 Imágenes subidas:', images);
    this.productForm.images = images;
  }

  onImageRemoved(imageUrl: string): void {
    console.log('🗑️ Imagen eliminada:', imageUrl);
    if (this.productForm.images) {
      this.productForm.images = this.productForm.images.filter(img => img !== imageUrl);
    }
  }
}
