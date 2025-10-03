import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  user: any = null;
  loading = false;
  activeTab = 'profile';

  myTickets: any[] = [];
  purchaseHistory: any[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.profileForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      firstName: [''],
      lastName: [''],
      phone: [''],
      address: [''],
      city: [''],
      country: [''],
      dateOfBirth: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    // Forzar recarga de datos del AuthService
    this.authService.checkStoredToken();
    this.loadUserData();
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value ? null : { mismatch: true };
  }

  loadUserData() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    // Obtener datos frescos de la base de datos
    const token = localStorage.getItem('token');
    this.http.get('http://localhost:3001/api/users/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.user = response.user;
          console.log('Usuario desde base de datos:', this.user);
          
          // Actualizar AuthService con datos frescos
          this.authService.updateCurrentUser(this.user);
          
          // Llenar formulario con datos actualizados
          this.profileForm.patchValue({
            username: this.user.email || '',
            firstName: this.user.firstName || '',
            lastName: this.user.lastName || '',
            phone: this.user.phone || '',
            address: this.user.address || '',
            city: this.user.city || '',
            country: this.user.country || 'ES',
            dateOfBirth: this.user.dateOfBirth || ''
          });
        }
      },
      error: (error) => {
        console.error('Error cargando perfil:', error);
        // Fallback al usuario del AuthService
        this.user = currentUser;
        this.profileForm.patchValue({
          username: this.user.email || '',
          firstName: this.user.firstName || '',
          lastName: this.user.lastName || '',
          phone: this.user.phone || '',
          address: this.user.address || '',
          city: this.user.city || '',
          country: this.user.country || 'ES',
          dateOfBirth: this.user.dateOfBirth || ''
        });
      }
    });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  updateProfile() {
    if (this.profileForm.invalid) {
      Object.keys(this.profileForm.controls).forEach(key => {
        const control = this.profileForm.get(key);
        if (control && control.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.loading = true;
    const token = localStorage.getItem('token');
    
    this.http.put('http://localhost:3001/api/users/profile', this.profileForm.value, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }).subscribe({
      next: (response: any) => {
        this.loading = false;
        
        if (response.success) {
          setTimeout(() => {
            const updatedUser = { ...this.user, ...response.user };
            this.user = updatedUser;
            this.authService.updateCurrentUser(updatedUser);
            this.cdr.detectChanges();
          }, 0);

          Swal.fire({
            icon: 'success',
            title: '¡Perfil actualizado!',
            text: 'Tus datos han sido guardados correctamente en la base de datos',
            timer: 2000,
            showConfirmButton: false
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.message || 'Error al actualizar el perfil'
          });
        }
      },
      error: (error) => {
        this.loading = false;
        this.cdr.detectChanges();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.error?.message || 'Error al conectar con el servidor'
        });
      }
    });
  }

  changePassword() {
    if (this.passwordForm.invalid) {
      Object.keys(this.passwordForm.controls).forEach(key => {
        const control = this.passwordForm.get(key);
        if (control && control.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.loading = true;
    const token = localStorage.getItem('token');
    
    this.http.put('http://localhost:3001/api/auth/change-password', {
      newPassword: this.passwordForm.value.newPassword
    }, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (response: any) => {
        this.loading = false;
        if (response.success) {
          this.passwordForm.reset();
          Swal.fire({
            icon: 'success',
            title: 'Contraseña Actualizada',
            text: 'Tu contraseña ha sido cambiada exitosamente',
            timer: 2000,
            showConfirmButton: false
          });
        }
      },
      error: (error) => {
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.error?.message || 'Error al cambiar la contraseña'
        });
      }
    });
  }

  getRoleDisplayName(role: string): string {
    switch(role) {
      case 'admin': 
      case 'ADMIN': return 'Administrador';
      case 'super_admin':
      case 'SUPER_ADMIN': return 'Super Admin';
      case 'vip':
      case 'VIP': return 'VIP';
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
      case 'vip':
      case 'VIP': return 'badge bg-warning text-dark';
      default: return 'badge bg-secondary';
    }
  }

  // Métodos VIP
  isVipUser(): boolean {
    return this.user?.role === 'VIP' || this.user?.role === 'vip';
  }

  goToVipInfo() {
    this.router.navigate(['/vip-info']);
  }

  // Métodos para badges de estado
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'confirmed': return 'badge bg-success';
      case 'pending': return 'badge bg-warning text-dark';
      case 'completed': return 'badge bg-info';
      case 'cancelled': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'pending': return 'Pendiente';
      case 'completed': return 'Completado';
      case 'cancelled': return 'Cancelado';
      default: return 'Desconocido';
    }
  }
}
