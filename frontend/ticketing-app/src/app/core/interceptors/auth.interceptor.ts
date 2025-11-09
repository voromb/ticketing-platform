import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  let authReq = req;

  if (token) {
    console.log('🔑 Añadiendo token JWT a la request:', req.url);
    
    // Obtener datos del usuario desde localStorage
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    const userType = localStorage.getItem('userType');
    
    console.log('📦 Datos en localStorage:', { userId, userName, userType });
    
    // Clonar request y agregar todos los headers
    let headers = req.headers.set('Authorization', `Bearer ${token}`);
    
    // Agregar headers personalizados si existen
    if (userId) {
      headers = headers.set('X-User-Id', userId);
      console.log('📝 Agregando X-User-Id:', userId);
    } else {
      console.warn('⚠️ No hay userId en localStorage');
    }
    
    if (userName) {
      headers = headers.set('X-User-Name', userName);
      console.log('📝 Agregando X-User-Name:', userName);
    } else {
      console.warn('⚠️ No hay userName en localStorage');
    }
    
    if (userType) {
      headers = headers.set('X-User-Type', userType);
      console.log('📝 Agregando X-User-Type:', userType);
    } else {
      console.warn('⚠️ No hay userType en localStorage');
    }
    
    console.log('📤 Headers finales:', headers.keys());
    
    authReq = req.clone({ headers });
  } else {
    // Silenciar warning para rutas de Ollama (no requieren JWT)
    if (!req.url.includes('/api/ollama')) {
      console.log('⚠️ No hay token JWT para:', req.url);
    }
  }

  //console.log('🌐 Enviando petición HTTP:', authReq.url);

  return next(authReq).pipe(
    tap((response) => {
     // console.log('✅ Respuesta HTTP recibida para:', authReq.url, response);
    }),
    catchError((error) => {
     // console.error('❌ Error HTTP en:', authReq.url, error);
      return throwError(() => error);
    })
  );
};
