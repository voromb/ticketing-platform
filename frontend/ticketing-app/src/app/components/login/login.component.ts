import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
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
    private http: HttpClient,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]], // Removemos validación de email para permitir username
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    // Si ya está logueado, redirigir
    if (localStorage.getItem('token')) {
      this.router.navigate(['/events']);
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
    
    this.http.post('http://localhost:3001/api/auth/login', this.loginForm.value).subscribe({
      next: (response: any) => {
        this.loading = false;
        if (response.success) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          
          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: `¡Bienvenido ${response.user.username || response.user.email}!`,
            showConfirmButton: false,
            timer: 1500
          }).then(() => {
            this.redirectByRole(response.user.role);
          });
        }
      },
      error: (error) => {
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.error?.message || 'Credenciales incorrectas'
        });
      }
    });
  }

  private redirectByRole(role: string) {
    switch(role) {
      case 'admin':
        this.router.navigate(['/admin']);
        break;
      case 'company':
        this.router.navigate(['/company']);
        break;
      default:
        this.router.navigate(['/events']);
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}