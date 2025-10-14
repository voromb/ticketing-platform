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
    authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });
  } else {
    console.log('⚠️ No hay token JWT para:', req.url);
  }

  console.log('🌐 Enviando petición HTTP:', authReq.url);

  return next(authReq).pipe(
    tap((response) => {
      console.log('✅ Respuesta HTTP recibida para:', authReq.url, response);
    }),
    catchError((error) => {
      console.error('❌ Error HTTP en:', authReq.url, error);
      return throwError(() => error);
    })
  );
};
