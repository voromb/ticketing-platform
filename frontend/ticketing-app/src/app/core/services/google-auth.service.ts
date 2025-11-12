import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import Swal from 'sweetalert2';

declare global {
  interface Window {
    google: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  // Configura tu Client ID de Google aquí
  private readonly GOOGLE_CLIENT_ID = '1058298797605-9pq0sercagl0v2k5jivmgflntglluimd.apps.googleusercontent.com';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    console.log('🔧 GoogleAuthService initialized');
    console.log('🔑 Client ID:', this.GOOGLE_CLIENT_ID);
    this.loadGoogleScript();
  }

  private loadGoogleScript() {
    console.log('🚀 Loading Google script...');
    if (typeof window !== 'undefined' && !window.google) {
      console.log('📜 Creating script tag...');
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('✅ Google script loaded!');
        this.initializeGoogleSignIn();
      };
      script.onerror = () => {
        console.error('❌ Failed to load Google script');
      };
      document.head.appendChild(script);
    } else if (window.google) {
      console.log('✅ Google already available');
      this.initializeGoogleSignIn();
    } else {
      console.log('⏳ Waiting for window...');
    }
  }

  private initializeGoogleSignIn() {
    if (window.google && this.GOOGLE_CLIENT_ID) {
      window.google.accounts.id.initialize({
        client_id: this.GOOGLE_CLIENT_ID,
        callback: (response: any) => this.handleGoogleResponse(response),
        auto_select: false,
        cancel_on_tap_outside: true
      });
    }
  }

  public signInWithGoogle(): Promise<any> {
    console.log('🎯 signInWithGoogle called');
    console.log('🔍 window.google:', !!window.google);
    console.log('🔍 GOOGLE_CLIENT_ID:', this.GOOGLE_CLIENT_ID);
    
    return new Promise((resolve, reject) => {
      if (!window.google) {
        Swal.fire({
          icon: 'info',
          title: 'Cargando...',
          text: 'Cargando Google Sign-In. Intenta de nuevo en unos segundos.',
          timer: 3000
        });
        reject('Google SDK not loaded');
        return;
      }

      // Mostrar directamente el popup de consentimiento
      Swal.fire({
        icon: 'info',
        title: 'Redirigiendo a Google...',
        text: 'Se abrirá una ventana de Google para iniciar sesión.',
        timer: 2000,
        showConfirmButton: false
      });

      // Usar el método de popup directo
      window.google.accounts.id.prompt();
    });
  }

  private async handleGoogleResponse(response: any) {
    try {
      // Enviar el token al backend para validación
      const result = await this.http.post(`${environment.userApiUrl}/auth/google-login`, {
        token: response.credential
      }).toPromise();

      if (result && (result as any).success) {
        const userData = (result as any);
        
        // Guardar datos del usuario
        localStorage.setItem('token', userData.token);
        localStorage.setItem('user', JSON.stringify(userData.user));
        
        this.isLoggedInSubject.next(true);

        Swal.fire({
          icon: 'success',
          title: '¡Bienvenido!',
          text: `Hola ${userData.user.username}`,
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          this.router.navigate(['/events']);
        });
      }
    } catch (error: any) {
      console.error('Error en Google login:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.error?.message || 'Error al iniciar sesión con Google'
      });
    }
  }

  public renderGoogleButton(elementId: string) {
    if (window.google && this.GOOGLE_CLIENT_ID) {
      window.google.accounts.id.renderButton(
        document.getElementById(elementId),
        {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left'
        }
      );
    }
  }

  public setGoogleClientId(clientId: string) {
    // Método para configurar el Client ID dinámicamente
    (this as any).GOOGLE_CLIENT_ID = clientId;
    this.initializeGoogleSignIn();
  }
}
