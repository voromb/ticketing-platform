import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  user: any = null;
  showDropdown = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadUser();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown')) {
      this.showDropdown = false;
    }
  }

  loadUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.user = JSON.parse(userStr);
    }
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
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Sesión cerrada',
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          this.router.navigate(['/login']);
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

  getRoleDisplayName(role: string): string {
    switch(role) {
      case 'admin': return 'Administrador';
      case 'company': return 'Empresa';
      case 'user': return 'Usuario';
      default: return 'Usuario';
    }
  }

  getRoleBadgeClass(role: string): string {
    switch(role) {
      case 'admin': return 'badge bg-danger';
      case 'company': return 'badge bg-warning text-dark';
      case 'user': return 'badge bg-primary';
      default: return 'badge bg-secondary';
    }
  }
}
