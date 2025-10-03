import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'user' | 'vip' | 'admin' | 'super_admin' | 'ADMIN' | 'SUPER_ADMIN';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:3003/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.checkStoredToken();
  }

  public checkStoredToken() {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        let user: User = {
          id: payload.id,
          email: payload.email,
          firstName: payload.firstName,
          lastName: payload.lastName,
          role: payload.role
        };
        
        // Si hay datos actualizados en localStorage, usarlos
        if (storedUser) {
          const parsedStoredUser = JSON.parse(storedUser);
          user = { ...user, ...parsedStoredUser };
        }
        
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error decoding token:', error);
        this.logout();
      }
    }
  }

  login(email: string, password: string): Observable<any> {
    return new Observable(observer => {
      this.tryAdminLogin(email, password).subscribe({
        next: (response) => {
          this.handleSuccessfulLogin(response);
          observer.next(response);
          observer.complete();
        },
        error: (adminError) => {
          // Si falla admin, intentar con user-service (para usuarios normales)
          this.tryUserLogin(email, password).subscribe({
            next: (response) => {
              this.handleSuccessfulLogin(response);
              observer.next(response);
              observer.complete();
            },
            error: (userError) => {
              // Si ambos fallan, devolver error
              observer.error(userError);
            }
          });
        }
      });
    });
  }

  private tryAdminLogin(email: string, password: string): Observable<any> {
    return this.http.post<any>('http://localhost:3003/api/auth/login', { email, password });
  }

  private tryUserLogin(email: string, password: string): Observable<any> {
    return this.http.post<any>('http://localhost:3001/api/auth/login', { email, password });
  }

  private handleSuccessfulLogin(response: any): void {
    if (response.token) {
      localStorage.setItem('token', response.token);
      
      // Decodificar el token para obtener la información del usuario
      const payload = JSON.parse(atob(response.token.split('.')[1]));
      const user: User = {
        id: payload.id,
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        role: payload.role
      };
      
      this.currentUserSubject.next(user);
    }
  }

  logout() {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      return Date.now() < exp;
    } catch {
      return false;
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  updateCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
    localStorage.setItem('user', JSON.stringify(user));
  }

  hasRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  isAdmin(): boolean {
    return this.hasRole(['admin', 'super_admin']);
  }

  isSuperAdmin(): boolean {
    return this.hasRole(['super_admin']);
  }
}
