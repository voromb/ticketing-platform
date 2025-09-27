import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
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
    switch(role) {
      case 'ADMIN':
      case 'SUPER_ADMIN':
        this.router.navigate(['/admin-dashboard']);
        break;
      case 'admin':
      case 'super_admin':
        this.router.navigate(['/admin-dashboard']);
        break;
      case 'vip':
      case 'user':
        this.router.navigate(['/shop']);
        break;
      case 'company':
        this.router.navigate(['/shop']); // Temporal, redirigir a shop
        break;
      default:
        this.router.navigate(['/shop']); // Por defecto ir a shop (panel usuario)
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}