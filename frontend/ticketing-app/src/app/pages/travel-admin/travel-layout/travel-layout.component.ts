import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-travel-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './travel-layout.component.html',
  styles: []
})
export class TravelLayoutComponent implements OnInit {
  currentUser: any = null;

  menuItems = [
    { 
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      label: 'Dashboard',
      route: '/travel-admin/dashboard'
    },
    { 
      icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
      label: 'Mis Viajes',
      route: '/travel-admin/list'
    },
    { 
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      label: 'Reservas',
      route: '/travel-admin/bookings'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
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
