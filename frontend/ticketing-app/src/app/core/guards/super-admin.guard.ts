import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SuperAdminGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.authService.currentUser$.pipe(
      map(user => {
        const superAdminRoles = ['super_admin', 'SUPER_ADMIN'];
        if (user && superAdminRoles.includes(user.role)) {
          return true;
        } else {
          this.router.navigate(['/admin-dashboard']);
          return false;
        }
      })
    );
  }
}
