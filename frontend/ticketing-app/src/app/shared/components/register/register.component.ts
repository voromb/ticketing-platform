import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HttpClientModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
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

    console.log('Enviando datos de registro:', userData);
    
    this.http.post('http://localhost:3001/api/auth/register', userData)
      .pipe(
        finalize(() => {
          // Esto SIEMPRE se ejecuta, haya éxito o error
          this.loading = false;
          console.log('🔄 Loading detenido');
        })
      )
      .subscribe({
      next: (response: any) => {
        console.log('✅ Respuesta del servidor:', response);
        
        // Verificar si el registro fue exitoso
        if (response.success || response.token) {
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
          // Si la respuesta no indica éxito
          Swal.fire({
            icon: 'warning',
            title: 'Registro completado',
            text: 'Tu cuenta ha sido creada. Por favor inicia sesión.',
            confirmButtonText: 'Ir a Login',
          }).then(() => {
            this.router.navigate(['/login']);
          });
        }
      },
      error: (error) => {
        console.error('❌ Error completo:', error);
        console.error('📋 Error status:', error.status);
        console.error('📋 Error message:', error.message);
        console.error('📋 Error details:', error.error);
        
        let errorMessage = 'Error al registrar usuario';
        let errorTitle = 'Error en el registro';
        
        // Mensajes específicos según el error
        if (error.status === 0) {
          errorTitle = 'Error de conexión';
          errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
        } else if (error.status === 409) {
          errorTitle = 'Usuario ya existe';
          errorMessage = 'El email o nombre de usuario ya está registrado.';
        } else if (error.status === 400) {
          errorTitle = 'Datos inválidos';
          errorMessage = error.error?.message || 'Verifica los datos ingresados.';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        Swal.fire({
          icon: 'error',
          title: errorTitle,
          text: errorMessage,
          confirmButtonText: 'Entendido',
        });
      },
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
