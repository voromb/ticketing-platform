import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-merchandising-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './merchandising-layout.component.html',
  styles: []
})
export class MerchandisingLayoutComponent implements OnInit {
  currentUser: any = null;

  menuItems = [
    { 
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      label: 'Dashboard',
      route: '/merchandising-admin/dashboard'
    },
    { 
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      label: 'Productos',
      route: '/merchandising-admin/list'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData(): void {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.currentUser = JSON.parse(userData);
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  isActiveRoute(route: string): boolean {
    return this.router.url === route;
  }
}
