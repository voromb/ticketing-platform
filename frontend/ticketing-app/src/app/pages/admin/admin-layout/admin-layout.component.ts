import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div class="fixed left-0 z-40 w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl transform transition-all duration-300 ease-in-out"
           style="top: 56px; bottom: 0;"
           [class.translate-x-0]="sidebarOpen"
           [class.-translate-x-full]="!sidebarOpen">

        <div class="flex items-center justify-center h-20 px-6 border-b border-slate-700/50">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gradient-to-r from-violet-500/20 to-purple-600/20 rounded-xl flex items-center justify-center shadow-lg border border-violet-500/30">
              <svg class="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-bold text-white">Admin Panel</h3>
            </div>
          </div>
        </div>

        <nav class="mt-8 px-4">
          <div class="space-y-3">

            <a routerLink="/admin-dashboard"
               routerLinkActive="bg-slate-700/90"
               style="border-radius: 24px;"
               class="group flex items-center px-6 py-4 text-sm font-medium text-white bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 hover:bg-slate-800/90 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
              <svg class="w-5 h-5 mr-3 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              <span>Dashboard</span>
            </a>

            <a routerLink="/admin-dashboard/events"
               routerLinkActive="bg-slate-700/90"
               style="border-radius: 24px;"
               class="group flex items-center px-6 py-4 text-sm font-medium text-white bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 hover:bg-slate-800/90 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
              <svg class="w-5 h-5 mr-3 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <span>Eventos</span>
            </a>

            <a routerLink="/admin-dashboard/venues"
               routerLinkActive="bg-slate-700/90"
               style="border-radius: 24px;"
               class="group flex items-center px-6 py-4 text-sm font-medium text-white bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 hover:bg-slate-800/90 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
              <svg class="w-5 h-5 mr-3 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
              <span>Venues</span>
            </a>

            <a routerLink="/admin-dashboard/users"
               routerLinkActive="bg-slate-700/90"
               style="border-radius: 24px;"
               class="group flex items-center px-6 py-4 text-sm font-medium text-white bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 hover:bg-slate-800/90 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
              <svg class="w-5 h-5 mr-3 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
              </svg>
              <span>Usuarios</span>
            </a>

            <a routerLink="/admin-dashboard/categories"
               routerLinkActive="bg-slate-700/90"
               style="border-radius: 24px;"
               class="group flex items-center px-6 py-4 text-sm font-medium text-white bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 hover:bg-slate-800/90 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
              <svg class="w-5 h-5 mr-3 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
              </svg>
              <span>Categorías</span>
            </a>

            <a *ngIf="isSuperAdmin"
               routerLink="/admin-dashboard/settings"
               routerLinkActive="bg-slate-700/90"
               style="border-radius: 24px;"
               class="group flex items-center px-6 py-4 text-sm font-medium text-white bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 hover:bg-slate-800/90 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
              <svg class="w-5 h-5 mr-3 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <span>Configuración</span>
            </a>

          </div>
        </nav>

      </div>

      <div *ngIf="sidebarOpen"
           class="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
           (click)="toggleSidebar()"></div>

      <div class="lg:pl-72" style="margin-top: 56px;">
        <main class="" style="min-height: calc(100vh - 56px);">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }
  `]
})
export class AdminLayoutComponent implements OnInit {
  sidebarOpen = true;
  pageTitle = 'Dashboard';
  currentUser: any = null;
  isSuperAdmin = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isSuperAdmin = user?.role === 'super_admin';
    });

    this.router.events.subscribe(() => {
      this.updatePageTitle();
    });
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getPageTitle(): string {
    const url = this.router.url;
    if (url.includes('/events')) {
      return 'Gestión de Eventos';
    } else if (url.includes('/venues')) {
      return 'Gestión de Venues';
    } else if (url.includes('/users')) {
      return 'Gestión de Usuarios';
    } else if (url.includes('/settings')) {
      return 'Configuración del Sistema';
    } else {
      return 'Dashboard Principal';
    }
  }

  getPageDescription(): string {
    const url = this.router.url;
    if (url.includes('/events')) {
      return 'Administra conciertos y eventos de rock/metal';
    } else if (url.includes('/venues')) {
      return 'Gestiona locales y espacios para conciertos';
    } else if (url.includes('/users')) {
      return 'Administra usuarios y promociones VIP';
    } else if (url.includes('/settings')) {
      return 'Configuración avanzada del sistema';
    } else {
      return 'Panel de control y estadísticas generales';
    }
  }

  private updatePageTitle() {
    this.pageTitle = this.getPageTitle();
  }

}
