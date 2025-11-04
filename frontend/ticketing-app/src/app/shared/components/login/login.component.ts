import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MessagingService } from '../../../core/services_enterprise/messaging.service';
import { SocialLoginComponent } from '../social-login/social-login.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, SocialLoginComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private messagingService: MessagingService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]], // Removemos validación de email para permitir username
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    // Si ya está logueado, redirigir
    if (this.authService.isAuthenticated()) {
      const user = this.authService.getCurrentUser();
      if (user) {
        this.redirectByRole(user.role);
      }
    }
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        const control = this.loginForm.get(key);
        if (control && control.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.loading = true;
    
    const { email, password } = this.loginForm.value;
    
    this.authService.login(email, password).subscribe({
      next: (response: any) => {
        this.loading = false;
        const user = this.authService.getCurrentUser();
        
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: `¡Bienvenido ${user?.firstName || user?.email}!`,
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          // Verificar mensajes no leídos después del login
          this.checkUnreadMessages();
          
          if (user) {
            this.redirectByRole(user.role);
          }
        });
      },
      error: (error) => {
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error de autenticación',
          text: error.error?.error || 'Credenciales incorrectas'
        });
      }
    });
  }

  private redirectByRole(role: string) {
    const user = this.authService.getCurrentUser();
    
    switch(role) {
      case 'ADMIN':
      case 'SUPER_ADMIN':
      case 'admin':
      case 'super_admin':
        this.router.navigate(['/admin-dashboard']);
        break;
      
      case 'COMPANY_ADMIN':
        // Redirigir según el tipo de compañía
        const companyType = (user as any)?.companyType;
        if (companyType === 'RESTAURANT') {
          this.router.navigate(['/restaurant-admin/dashboard']);
        } else if (companyType === 'TRAVEL') {
          this.router.navigate(['/travel-admin/dashboard']);
        } else if (companyType === 'MERCHANDISING') {
          this.router.navigate(['/merchandising-admin/dashboard']);
        } else {
          // Fallback si no se reconoce el tipo
          this.router.navigate(['/shop']);
        }
        break;
      
      case 'vip':
      case 'user':
        this.router.navigate(['/shop']);
        break;
      
      default:
        this.router.navigate(['/shop']); // Por defecto ir a shop (panel usuario)
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  private checkUnreadMessages() {
    console.log('🔔 Verificando mensajes no leídos después del login...');
    
    // Primero refrescar los contadores desde el backend
    this.messagingService.refreshUnreadCounts();
    
    // Esperar 2 segundos después del login para verificar mensajes
    setTimeout(() => {
      console.log('🔔 Llamando a getUnreadMessagesCount...');
      this.messagingService.getUnreadMessagesCount().subscribe({
        next: (count) => {
          console.log('🔔 Mensajes no leídos:', count);
          if (count > 0) {
            console.log('🔔 Mostrando alerta de mensajes no leídos');
            Swal.fire({
              title: '¡Tienes mensajes nuevos!',
              html: `Tienes <strong>${count}</strong> mensaje${count > 1 ? 's' : ''} sin leer`,
              icon: 'info',
              iconColor: '#007bff',
              confirmButtonText: 'Ver mensajes',
              confirmButtonColor: '#007bff',
              showCancelButton: true,
              cancelButtonText: 'Ahora no',
              cancelButtonColor: '#6c757d',
              backdrop: true,
              allowOutsideClick: true
            }).then((result) => {
              if (result.isConfirmed) {
                // Redirigir a la página de mensajes
                this.router.navigate(['/messages']);
              }
            });
          }
        },
        error: (error) => {
          console.warn('⚠️ No se pudo verificar mensajes no leídos:', error);
        }
      });
    }, 2000);
  }
}