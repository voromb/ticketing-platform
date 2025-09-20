import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../navbar/navbar.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NavbarComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  user: any = null;
  loading = false;
  activeTab = 'profile';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
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
    this.loadUserData();
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value ? null : { mismatch: true };
  }

  loadUserData() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.user = JSON.parse(userStr);
      
      // Cargar datos del perfil desde el servidor
      const token = localStorage.getItem('token');
      this.http.get(`http://localhost:3001/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: (response: any) => {
          if (response.success) {
            const userData = response.user;
            this.profileForm.patchValue({
              username: userData.username || '',
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              phone: userData.phone || '',
              address: userData.address || '',
              city: userData.city || '',
              country: userData.country || '',
              dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : ''
            });
          }
        },
        error: (error) => {
          console.error('Error loading profile:', error);
        }
      });
    } else {
      this.router.navigate(['/login']);
    }
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
    
    this.http.put('http://localhost:3001/api/auth/profile', this.profileForm.value, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (response: any) => {
        this.loading = false;
        if (response.success) {
          // Actualizar datos en localStorage
          const updatedUser = { ...this.user, ...this.profileForm.value };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          this.user = updatedUser;

          Swal.fire({
            icon: 'success',
            title: '¡Perfil actualizado!',
            text: 'Tus datos han sido guardados correctamente',
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
          text: error.error?.message || 'Error al actualizar el perfil'
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
      currentPassword: this.passwordForm.value.currentPassword,
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
            title: '¡Contraseña cambiada!',
            text: 'Tu contraseña ha sido actualizada correctamente',
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
