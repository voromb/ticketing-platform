import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'user' | 'vip' | 'admin' | 'super_admin' | 'ADMIN' | 'SUPER_ADMIN' | 'COMPANY_ADMIN';
  companyId?: string;
  companyType?: string;
  companyName?: string;
  companyRegion?: string;
  permissions?: any;
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
      // 1. Intentar login como COMPANY_ADMIN (festival-service)
      this.tryCompanyAdminLogin(email, password).subscribe({
        next: (response) => {
          this.handleSuccessfulLogin(response);
          observer.next(response);
          observer.complete();
        },
        error: (companyAdminError) => {
          // 2. Si falla, intentar como ADMIN/SUPER_ADMIN (admin-service)
          this.tryAdminLogin(email, password).subscribe({
            next: (response) => {
              this.handleSuccessfulLogin(response);
              observer.next(response);
              observer.complete();
            },
            error: (adminError) => {
              // 3. Si falla, intentar como USER/VIP (user-service)
              this.tryUserLogin(email, password).subscribe({
                next: (response) => {
                  this.handleSuccessfulLogin(response);
                  observer.next(response);
                  observer.complete();
                },
                error: (userError) => {
                  // Si todos fallan, devolver error
                  observer.error(userError);
                }
              });
            }
          });
        }
      });
    });
  }

  private tryCompanyAdminLogin(email: string, password: string): Observable<any> {
    return this.http.post<any>('http://localhost:3004/api/auth/company-admin/login', { email, password });
  }

  private tryAdminLogin(email: string, password: string): Observable<any> {
    return this.http.post<any>('http://localhost:3003/api/auth/login', { email, password });
  }

  private tryUserLogin(email: string, password: string): Observable<any> {
    return this.http.post<any>('http://localhost:3001/api/auth/login', { email, password });
  }

  private handleSuccessfulLogin(response: any): void {
    // Manejar token (puede venir como 'token' o 'access_token')
    const token = response.token || response.access_token;
    
    if (token) {
      localStorage.setItem('token', token);
      
      // Usar la información del admin/user que viene en la respuesta
      const userData = response.admin || response.user || response.companyAdmin;
      
      if (userData) {
        const user: any = {
          id: userData.id || userData._id,
          email: userData.email,
          firstName: userData.firstName || userData.first_name,
          lastName: userData.lastName || userData.last_name,
          role: userData.role || 'user',
          companyId: userData.company?.id || userData.companyId,
          companyType: userData.company?.type || userData.companyType,
          companyName: userData.company?.name || userData.companyName,
          companyRegion: userData.company?.region || userData.companyRegion,
          permissions: userData.permissions
        };
        
        console.log('🔐 Usuario logueado:', user);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Guardar datos individuales para el servicio de mensajería
        localStorage.setItem('userId', user.id);
        localStorage.setItem('userName', `${user.firstName} ${user.lastName}`);
        localStorage.setItem('userType', user.role.toUpperCase());
        
        console.log('💾 Datos guardados en localStorage:', {
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          userType: user.role.toUpperCase()
        });
        
        this.currentUserSubject.next(user);
      }
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userType');
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
