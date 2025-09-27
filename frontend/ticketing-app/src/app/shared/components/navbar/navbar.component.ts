import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService, User } from '../../../core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  user: User | null = null;
  showDropdown = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    console.log('🔄 Navbar inicializándose...');
    
    // Suscribirse a cambios en el usuario
    this.authService.currentUser$.subscribe(user => {
      console.log('👤 Navbar - Usuario actualizado:', user);
      this.user = user;
    });
    
    // Verificar estado inicial
    console.log('🔍 Navbar - Estado inicial:', {
      isLoggedIn: this.isLoggedIn,
      isAdmin: this.isAdmin,
      user: this.user,
      currentUrl: this.router.url
    });
    
    // Si estamos en admin-dashboard pero no hay usuario, forzar verificación
    if (this.router.url.includes('/admin-dashboard') && !this.user) {
      console.log('🔧 Forzando verificación de token...');
      setTimeout(() => {
        const token = localStorage.getItem('token');
        if (token) {
          console.log('🔑 Token encontrado, reintentando...');
          // Forzar re-verificación del AuthService
          this.authService.checkStoredToken();
        }
      }, 100);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown')) {
      this.showDropdown = false;
    }
  }

  get isLoggedIn(): boolean {
    return this.user !== null;
  }

  get isAdmin(): boolean {
    return this.user !== null && ['admin', 'super_admin', 'ADMIN', 'SUPER_ADMIN'].includes(this.user.role);
  }

  get isSuperAdmin(): boolean {
    return this.user !== null && ['super_admin', 'SUPER_ADMIN'].includes(this.user.role);
  }

  toggleDropdown(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.showDropdown = !this.showDropdown;
  }

  closeDropdown() {
    this.showDropdown = false;
  }

  logout(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro de que quieres salir?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout();
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Sesión cerrada',
          showConfirmButton: false,
          timer: 1500
        });
      }
    });
  }

  goToProfile(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.closeDropdown();
    this.router.navigate(['/profile']);
  }

  goToMyTickets(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.closeDropdown();
    // Función para ver mis tickets (implementar después)
    Swal.fire({
      icon: 'info',
      title: 'Próximamente',
      text: 'Función de mis tickets en desarrollo'
    });
  }

  goToAdminDashboard(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.closeDropdown();
    this.router.navigate(['/admin-dashboard']);
  }

  goToUserPanel(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.closeDropdown();
    this.router.navigate(['/shop']);
  }

  getRoleDisplayName(role: string): string {
    switch(role) {
      case 'admin':
      case 'ADMIN': return 'Administrador';
      case 'super_admin':
      case 'SUPER_ADMIN': return 'Super Admin';
      case 'vip': return 'Usuario VIP';
      case 'user': return 'Usuario';
      case 'company': return 'Empresa';
      default: return 'Usuario';
    }
  }

  getRoleBadgeClass(role: string): string {
    switch(role) {
      case 'admin':
      case 'ADMIN': return 'badge bg-danger';
      case 'super_admin':
      case 'SUPER_ADMIN': return 'badge bg-dark';
      case 'vip': return 'badge bg-warning text-dark';
      case 'user': return 'badge bg-primary';
      case 'company': return 'badge bg-info';
      default: return 'badge bg-secondary';
    }
  }
}
