import { Component, OnInit, HostListener, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService, User } from '../../../core/services/auth.service';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { SearchBarComponent } from '../search-bar/search-bar';
import { NotificationsComponent } from '../notifications/notifications';
import { MessagingService } from '../../../services/messaging.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, SearchBarComponent, NotificationsComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  user: User | null = null;
  showDropdown = false;
  unreadMessagesCount = 0;
  private userSubscription?: Subscription;
  private messagesCountSubscription?: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private messagingService: MessagingService
  ) {}

  ngOnInit() {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.user = user;
      this.cdr.markForCheck();
    });
    
    // Suscribirse al contador de mensajes no leídos
    this.messagesCountSubscription = this.messagingService.getUnreadMessagesCount().subscribe({
      next: (count) => {
        this.unreadMessagesCount = count;
        this.cdr.markForCheck();
      }
    });
    
    if (this.router.url.includes('/admin-dashboard') && !this.user) {
      setTimeout(() => {
        const token = localStorage.getItem('token');
        if (token) {
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

  get isCompanyAdmin(): boolean {
    return this.user !== null && this.user.role === 'COMPANY_ADMIN';
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


  goToAdminDashboard(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.closeDropdown();
    this.router.navigate(['/admin-dashboard']);
  }

  goToCompanyAdminPanel(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.closeDropdown();
    
    // Redirigir según el tipo de compañía del usuario
    // Por ahora redirigimos al panel de restaurantes
    // TODO: Obtener el tipo de compañía del usuario y redirigir al panel correcto
    this.router.navigate(['/restaurant-admin/dashboard']);
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
      case 'COMPANY_ADMIN': return 'Gestor de Servicios';
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
      case 'COMPANY_ADMIN': return 'badge bg-success';
      case 'vip': return 'badge bg-warning text-dark';
      case 'user': return 'badge bg-primary';
      case 'company': return 'badge bg-info';
      default: return 'badge bg-secondary';
    }
  }

  goToMessages(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.router.navigate(['/messages']);
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.messagesCountSubscription) {
      this.messagesCountSubscription.unsubscribe();
    }
  }
}
