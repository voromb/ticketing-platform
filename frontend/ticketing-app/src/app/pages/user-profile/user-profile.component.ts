import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  user: any = null;
  activeTab = 'profile';
  loading = false;
  
  // Formularios
  profileForm: FormGroup;
  changePasswordForm: FormGroup;
  showPasswordForm = false;

  // Mock data para tickets y historial
  myTickets = [
    {
      id: '1',
      eventName: 'Valencia Metal Battle 2024',
      venue: 'Metal Underground Club',
      date: '2024-11-15',
      quantity: 2,
      status: 'confirmed',
      price: 30.00
    },
    {
      id: '2', 
      eventName: 'Nightwish Symphonic Tour',
      venue: 'Sala Rockstar Valencia',
      date: '2024-12-10',
      quantity: 1,
      status: 'pending',
      price: 55.00
    }
  ];

  purchaseHistory = [
    {
      id: '1',
      eventName: 'Metallica World Tour Valencia',
      date: '2024-09-20',
      quantity: 2,
      total: 150.00,
      status: 'completed'
    },
    {
      id: '2',
      eventName: 'Classic Rock Legends',
      date: '2024-10-05', 
      quantity: 1,
      total: 35.00,
      status: 'completed'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.profileForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      phone: [''],
      address: [''],
      city: [''],
      country: ['España'],
      dateOfBirth: ['']
    });

    this.changePasswordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.loadUserData();
    
    // Forzar detección de cambios
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  loadUserData() {
    this.user = this.authService.getCurrentUser();
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }

    // Cargar datos adicionales del perfil si están disponibles
    this.profileForm.patchValue({
      firstName: this.user.firstName || '',
      lastName: this.user.lastName || '',
      phone: this.user.phone || '',
      address: this.user.address || '',
      city: this.user.city || '',
      country: this.user.country || 'España',
      dateOfBirth: this.user.dateOfBirth || ''
    });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  isVipUser(): boolean {
    return this.user?.role === 'VIP' || this.user?.role === 'vip';
  }

  getUserInitials(): string {
    if (this.user?.firstName && this.user?.lastName) {
      return `${this.user.firstName.charAt(0)}${this.user.lastName.charAt(0)}`.toUpperCase();
    }
    return this.user?.email?.charAt(0).toUpperCase() || 'U';
  }

  getRoleDisplayName(): string {
    if (this.isVipUser()) return 'VIP';
    return 'Usuario';
  }

  getRoleBadgeClass(): string {
    if (this.isVipUser()) return 'bg-amber-100 text-amber-800';
    return 'bg-gray-100 text-gray-800';
  }

  updateProfile() {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched(this.profileForm);
      return;
    }

    this.loading = true;
    
    // Simular actualización del perfil
    setTimeout(() => {
      this.loading = false;
      
      // Actualizar datos del usuario
      const updatedUser = { ...this.user, ...this.profileForm.value };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      this.user = updatedUser;

      Swal.fire({
        icon: 'success',
        title: 'Perfil Actualizado',
        text: 'Tus datos han sido guardados correctamente',
        timer: 2000,
        showConfirmButton: false
      });
    }, 1500);
  }

  togglePasswordForm() {
    this.showPasswordForm = !this.showPasswordForm;
    if (!this.showPasswordForm) {
      this.changePasswordForm.reset();
    }
  }

  onChangePassword() {
    if (this.changePasswordForm.invalid) {
      this.markFormGroupTouched(this.changePasswordForm);
      return;
    }

    this.loading = true;
    
    // Simular cambio de contraseña
    setTimeout(() => {
      this.loading = false;
      this.changePasswordForm.reset();
      this.showPasswordForm = false;
      
      Swal.fire({
        icon: 'success',
        title: 'Contraseña Actualizada',
        text: 'Tu contraseña ha sido cambiada exitosamente',
        timer: 2000,
        showConfirmButton: false
      });
    }, 2000);
  }

  goToVipInfo() {
    this.router.navigate(['/vip-info']);
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }
}
