import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AdminService, UserStats } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-8 pb-16 space-y-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          class="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700/50 p-8 hover:bg-slate-800/90 transition-all duration-200"
        >
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center">
                <svg
                  class="w-6 h-6 text-violet-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  ></path>
                </svg>
              </div>
            </div>
            <div class="ml-6 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-slate-400 truncate">Eventos Activos</dt>
                <dd class="text-2xl font-bold text-white mt-1">
                  {{ totalEvents || 0 }}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div
          class="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700/50 p-8 hover:bg-slate-800/90 transition-all duration-200"
        >
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center">
                <svg
                  class="w-6 h-6 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  ></path>
                </svg>
              </div>
            </div>
            <div class="ml-6 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-slate-400 truncate">Usuarios Totales</dt>
                <dd class="text-2xl font-bold text-white mt-1">
                  {{ userStats?.total || 0 }}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div
          class="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700/50 p-8 hover:bg-slate-800/90 transition-all duration-200"
        >
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center">
                <svg
                  class="w-6 h-6 text-yellow-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  ></path>
                </svg>
              </div>
            </div>
            <div class="ml-6 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-slate-400 truncate">Usuarios VIP</dt>
                <dd class="text-2xl font-bold text-white mt-1">
                  {{ userStats?.byRole?.vip || 0 }}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div
          class="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700/50 p-8 hover:bg-slate-800/90 transition-all duration-200"
        >
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center">
                <svg
                  class="w-6 h-6 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  ></path>
                </svg>
              </div>
            </div>
            <div class="ml-6 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-slate-400 truncate">Administradores</dt>
                <dd class="text-2xl font-bold text-white mt-1">
                  {{ (userStats?.byRole?.admin || 0) + (userStats?.byRole?.super_admin || 0) }}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div
          class="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700/50 p-8 hover:bg-slate-800/90 transition-all duration-200"
        >
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center">
                <svg
                  class="w-6 h-6 text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  ></path>
                </svg>
              </div>
            </div>
            <div class="ml-6 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-slate-400 truncate">Gestores de Servicios</dt>
                <dd class="text-2xl font-bold text-white mt-1">
                  {{ userStats?.byRole?.company_admin || 0 }}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div
          class="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700/50 p-8 hover:bg-slate-800/90 transition-all duration-200"
        >
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center">
                <svg
                  class="w-6 h-6 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  ></path>
                </svg>
              </div>
            </div>
            <div class="ml-6 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-slate-400 truncate">Venues Activos</dt>
                <dd class="text-2xl font-bold text-white mt-1">
                  {{ totalVenues || 0 }}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div
          class="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700/50 p-8 hover:bg-slate-800/90 transition-all duration-200"
        >
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center">
                <svg
                  class="w-6 h-6 text-yellow-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  ></path>
                </svg>
              </div>
            </div>
            <div class="ml-6 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-slate-400 truncate">Reservas VIP</dt>
                <dd class="text-2xl font-bold text-white mt-1">
                  {{ totalReservations || 0 }}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div
          class="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700/50 p-8 hover:bg-slate-800/90 transition-all duration-200"
        >
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center">
                <svg
                  class="w-6 h-6 text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  ></path>
                </svg>
              </div>
            </div>
            <div class="ml-6 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-slate-400 truncate">Órdenes Totales</dt>
                <dd class="text-2xl font-bold text-white mt-1">
                  {{ totalOrders || 0 }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div
        class="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700/50 p-8"
      >
        <h3 class="text-xl font-semibold text-white mb-6">Acciones Rápidas</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            (click)="navigateTo('/admin-dashboard/events/new')"
            style="border-radius: 24px;"
            class="flex items-center justify-center px-6 py-4 border border-slate-700/50 text-sm font-medium text-white bg-slate-800/80 hover:bg-slate-800/90 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              ></path>
            </svg>
            Crear Evento
          </button>

          <button
            (click)="navigateTo('/admin-dashboard/venues/new')"
            style="border-radius: 24px;"
            class="flex items-center justify-center px-6 py-4 border border-slate-700/50 text-sm font-medium text-white bg-slate-800/80 hover:bg-slate-800/90 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              ></path>
            </svg>
            Crear Venue
          </button>

          <button
            (click)="openUserSearchModal()"
            style="border-radius: 24px;"
            class="flex items-center justify-center px-6 py-4 border border-slate-700/50 text-sm font-medium text-white bg-slate-800/80 hover:bg-slate-800/90 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              ></path>
            </svg>
            Promocionar VIP
          </button>

          <button
            (click)="refreshData()"
            style="border-radius: 24px;"
            class="flex items-center justify-center px-6 py-4 border border-slate-700/50 text-sm font-medium text-white bg-slate-800/80 hover:bg-slate-800/90 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              ></path>
            </svg>
            Actualizar
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div
          class="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700/50"
        >
          <div class="px-8 py-6 border-b border-slate-700/50">
            <h3 class="text-xl font-semibold text-white">Eventos Recientes</h3>
          </div>
          <div class="p-6">
            <div *ngIf="recentEvents.length === 0" class="text-center text-slate-400 py-4">
              No hay eventos recientes
            </div>
            <div
              *ngFor="let event of recentEvents"
              class="flex items-center py-3 border-b border-slate-700/30 last:border-b-0"
            >
              <div class="flex-shrink-0">
                <div class="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                  <span class="text-violet-600 font-medium">🎵</span>
                </div>
              </div>
              <div class="ml-4 flex-1">
                <p class="text-sm font-medium text-white">{{ event.name }}</p>
                <p class="text-sm text-slate-300">
                  {{ event.venue?.name }} • {{ formatDate(event.eventDate) }}
                </p>
              </div>
              <div class="flex-shrink-0">
                <span
                  [class]="getStatusClass(event.status)"
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                >
                  {{ getStatusText(event.status) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          class="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700/50"
        >
          <div class="px-8 py-6 border-b border-slate-700/50">
            <h3 class="text-xl font-semibold text-white">Usuarios Recientes</h3>
          </div>
          <div class="p-6">
            <div
              *ngIf="userStats?.recentUsers?.length === 0"
              class="text-center text-slate-400 py-4"
            >
              No hay usuarios recientes
            </div>
            <div
              *ngFor="let user of userStats?.recentUsers"
              class="flex items-center py-3 border-b border-slate-700/30 last:border-b-0"
            >
              <div class="flex-shrink-0">
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span class="text-blue-600 font-medium">{{
                    user.username.charAt(0).toUpperCase()
                  }}</span>
                </div>
              </div>
              <div class="ml-4 flex-1">
                <p class="text-sm font-medium text-white">{{ user.username }}</p>
                <p class="text-sm text-slate-300">{{ user.email }}</p>
              </div>
              <div class="flex-shrink-0">
                <span
                  [class]="getRoleClass(user.role)"
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                >
                  {{ getRoleText(user.role) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        *ngIf="showUserSearchModal"
        class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      >
        <div
          class="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white"
        >
          <div class="flex items-center justify-between pb-3">
            <h3 class="text-lg font-bold text-gray-900">Buscar Usuario para Promocionar a VIP</h3>
            <button (click)="closeUserSearchModal()" class="text-gray-400 hover:text-gray-600">
              <span class="text-2xl">&times;</span>
            </button>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Buscar por nombre o email
            </label>
            <input
              [(ngModel)]="searchTerm"
              (input)="searchUsers()"
              type="text"
              placeholder="Escribe para buscar usuarios..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div *ngIf="searchResults.length > 0" class="max-h-64 overflow-y-auto border rounded-md">
            <div
              *ngFor="let user of searchResults"
              class="p-3 border-b hover:bg-gray-50 cursor-pointer flex items-center justify-between"
              (click)="selectUser(user)"
            >
              <div>
                <div class="font-medium text-gray-900">{{ user.username }}</div>
                <div class="text-sm text-gray-500">{{ user.email }}</div>
                <div class="text-xs">
                  <span [class]="getRoleClass(user.role)">{{ getRoleText(user.role) }}</span>
                </div>
              </div>
              <button class="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700">
                Seleccionar
              </button>
            </div>
          </div>

          <div
            *ngIf="searchTerm && searchResults.length === 0"
            class="text-center py-8 text-gray-500"
          >
            No se encontraron usuarios con ese criterio
          </div>

          <div *ngIf="!searchTerm" class="text-center py-8 text-gray-500">
            Escribe el nombre o email del usuario que quieres promocionar a VIP
          </div>
        </div>
      </div>

      <div
        *ngIf="showPromoteModal"
        class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      >
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div class="mt-3 text-center">
            <div
              class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100"
            >
              <span class="text-yellow-600 text-2xl">⭐</span>
            </div>

            <h3 class="text-lg font-medium text-gray-900 mt-4">Promocionar a VIP</h3>

            <div class="mt-2 px-7 py-3">
              <p class="text-sm text-gray-500 mb-4">
                ¿Estás seguro de que quieres promocionar a
                <strong>{{ selectedUser?.username }}</strong> a usuario VIP?
              </p>

              <div class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Razón</label>
                  <input
                    [(ngModel)]="promoteReason"
                    type="text"
                    placeholder="Ej: Cliente frecuente"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1"
                    >Notas (opcional)</label
                  >
                  <textarea
                    [(ngModel)]="promoteNotes"
                    rows="2"
                    placeholder="Notas adicionales..."
                    class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  ></textarea>
                </div>
              </div>
            </div>

            <div class="flex justify-center space-x-3 mt-4">
              <button
                (click)="closePromoteModal()"
                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                (click)="confirmPromoteToVip()"
                [disabled]="!promoteReason"
                class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                Promocionar a VIP
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  totalEvents = 0;
  totalUsers = 0;
  vipUsers = 0;
  totalVenues = 0;
  totalReservations = 0;
  totalOrders = 0;
  recentEvents: any[] = [];
  userStats: UserStats | null = null;
  loading = true;

  dashboardData$: any;

  showUserSearchModal = false;
  searchTerm = '';
  searchResults: any[] = [];
  selectedUser: any = null;
  showPromoteModal = false;
  promoteReason = '';
  promoteNotes = '';

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}
  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;

    this.dashboardData$ = forkJoin({
      userStats: this.adminService.getUserStats(),
      events: this.adminService.getEvents(),
      venues: this.adminService.getVenues(),
      reservations: this.adminService.getAllReservations(),
      orders: this.adminService.getAllOrders()
    });

    this.dashboardData$.subscribe({
      next: (results: any) => {
        if (results.userStats.stats) {
          this.userStats = results.userStats.stats;
          this.totalUsers = results.userStats.stats.total || 0;
          this.vipUsers = results.userStats.stats.byRole?.vip || 0;
        }

        if (results.events.data && Array.isArray(results.events.data)) {
          this.recentEvents = results.events.data.slice(0, 5);
          this.totalEvents = results.events.data.length;
        }

        if (results.venues.venues && Array.isArray(results.venues.venues)) {
          this.totalVenues = results.venues.venues.length;
        }

        if (results.reservations?.data) {
          this.totalReservations = results.reservations.data.length;
        }

        if (results.orders?.data) {
          this.totalOrders = results.orders.data.length;
        }

        this.loading = false;

        setTimeout(() => {
          this.cdr.detectChanges();
        }, 100);
      },
      error: (error: any) => {
        console.error('Error loading dashboard data:', error);
        this.loading = false;
      },
    });
  }

  refreshData() {
    this.loadDashboardData();
  }

  navigateTo(route: string) {
    // Navegar a la ruta especificada

    const routeMap: { [key: string]: { route: string; queryParams?: any } } = {
      '/admin-dashboard/events/new': {
        route: '/admin-dashboard/events',
        queryParams: { action: 'create' },
      },
      '/admin-dashboard/venues/new': {
        route: '/admin-dashboard/venues',
        queryParams: { action: 'create' },
      },
      '/admin-dashboard/users': {
        route: '/admin-dashboard/users',
        queryParams: { action: 'promote' },
      },
    };

    const navigation = routeMap[route];
    if (navigation) {
      this.router.navigate([navigation.route], {
        queryParams: navigation.queryParams,
      });
    } else {
      this.router.navigate([route]);
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  openUserSearchModal() {
    this.showUserSearchModal = true;
    this.searchTerm = '';
    this.searchResults = [];
  }

  closeUserSearchModal() {
    this.showUserSearchModal = false;
    this.searchTerm = '';
    this.searchResults = [];
  }

  searchUsers() {
    if (this.searchTerm.length < 2) {
      this.searchResults = [];
      return;
    }

    this.adminService.getUsers().subscribe({
      next: (response) => {
        this.searchResults = response.users
          .filter(
            (user: any) =>
              user.username.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
              user.email.toLowerCase().includes(this.searchTerm.toLowerCase())
          )
          .filter((user: any) => user.role !== 'vip');
      },
      error: (error) => {
        console.error('Error searching users:', error);
        this.searchResults = [];
      },
    });
  }

  selectUser(user: any) {
    this.selectedUser = user;
    this.showUserSearchModal = false;
    this.showPromoteModal = true;
    this.promoteReason = '';
    this.promoteNotes = '';
  }

  closePromoteModal() {
    this.showPromoteModal = false;
    this.selectedUser = null;
    this.promoteReason = '';
    this.promoteNotes = '';
  }

  confirmPromoteToVip() {
    if (!this.selectedUser || !this.promoteReason) return;

    const data = {
      reason: this.promoteReason,
      notes: this.promoteNotes,
    };

    const userName = this.selectedUser.username;

    this.adminService.promoteToVip(this.selectedUser._id, data).subscribe({
      next: (response) => {
        // Usuario promocionado exitosamente
        this.closePromoteModal();
        this.loadDashboardData();
        alert(`✅ ${userName} ha sido promocionado a VIP exitosamente`);
      },
      error: (error) => {
        console.error('Error promoting user:', error);
        alert('❌ Error al promocionar usuario: ' + (error.error?.message || error.message));
      },
    });
  }

  getRoleClass(role: string): string {
    switch (role?.toLowerCase()) {
      case 'vip':
        return 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs';
      case 'company_admin':
        return 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs';
      case 'admin':
        return 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs';
      case 'super_admin':
        return 'bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs';
      default:
        return 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs';
    }
  }

  getRoleText(role: string): string {
    switch (role?.toLowerCase()) {
      case 'vip':
        return 'VIP';
      case 'company_admin':
        return 'Gestor de Servicios';
      case 'admin':
        return 'Admin';
      case 'super_admin':
        return 'Super Admin';
      default:
        return 'Usuario';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'Activo';
      case 'DRAFT':
        return 'Borrador';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return status;
    }
  }
}
