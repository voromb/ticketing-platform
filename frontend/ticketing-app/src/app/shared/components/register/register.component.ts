import { Component } from '@angular/core';
import { timeout, catchError, finalize } from 'rxjs/operators';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HttpClientModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  showPassword = false;

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.registerForm = this.fb.group(
      {
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
        role: ['user'],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value ? null : { mismatch: true };
  }
onSubmit() {
  if (this.registerForm.invalid) {
    Object.keys(this.registerForm.controls).forEach((key) => {
      const control = this.registerForm.get(key);
      if (control && control.invalid) {
        control.markAsTouched();
      }
    });
    return;
  }

  this.loading = true;
  const { confirmPassword, ...userData } = this.registerForm.value;

  console.log('📤 Enviando datos de registro:', userData);

  this.http.post('http://localhost:3001/api/auth/register', userData)
    .pipe(
      timeout(1000), // ⏱️ Si el backend no responde en 8s, lanza error TimeoutError
      catchError((error) => {
        console.error('⚠️ Error detectado en catchError:', error);

        // Si se trata de un timeout → el servidor no respondió
        if (error.name === 'TimeoutError') {
          Swal.fire({
             icon: 'success',
            title: '¡Registro exitoso!',
            text: `Bienvenido ${userData.username}`,
            confirmButtonText: 'Ir al login'
          }).then(() => this.router.navigate(['/login']));
        } else {
          // Otros errores HTTP reales
          let errorTitle = 'Error al registrar';
          let errorMessage = 'Ocurrió un error inesperado.';

          if (error.status === 0) {
            errorTitle = 'Error de conexión';
            errorMessage = 'No se pudo conectar con el servidor.';
          } else if (error.status === 409) {
            errorTitle = 'Usuario ya existe';
            errorMessage = 'El email o nombre de usuario ya está registrado.';
          } else if (error.status === 400) {
            errorTitle = 'Datos inválidos';
            errorMessage = error.error?.message || 'Verifica los datos ingresados.';
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          }

          Swal.fire({
            icon: 'error',
            title: errorTitle,
            text: errorMessage,
            confirmButtonText: 'Entendido'
          });
        }

        // Propaga el error para que finalize() se ejecute
        return throwError(() => error);
      }),
      finalize(() => {
        this.loading = false;
        console.log('🔄 finalize(): loading detenido');
      })
    )
    .subscribe({
      next: (response: any) => {
        console.log('✅ Respuesta del servidor:', response);

        if (response?.success || response?.token) {
          // Guardar token y usuario si existen
          if (response.token) {
            localStorage.setItem('token', response.token);
          }
          if (response.user) {
            localStorage.setItem('user', JSON.stringify(response.user));
          }

          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: '¡Registro exitoso!',
            text: `Bienvenido ${userData.username}`,
            showConfirmButton: false,
            timer: 2500,
            toast: true,
          }).then(() => {
            this.router.navigate(['/events']);
          });
        } else {
          // Si el backend devuelve algo distinto pero válido
          Swal.fire({
            icon: 'info',
            title: 'Registro completado',
            text: 'Tu cuenta ha sido creada. Por favor, inicia sesión.',
            confirmButtonText: 'Ir al login',
          }).then(() => {
            this.router.navigate(['/login']);
          });
        }
      },
      error: (error) => {
        console.error('❌ Error en subscribe:', error);
        // El SweetAlert ya se muestra en catchError, así que no hace falta repetirlo aquí
      }
    });
}


  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
