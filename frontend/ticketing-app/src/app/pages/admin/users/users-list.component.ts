import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdminService, User, UserStats } from '../../../core/services/admin.service';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-8 pb-16 space-y-8">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white">Gestión de Usuarios</h1>
          <p class="mt-2 text-sm text-slate-300">Administra usuarios y promociones VIP</p>
        </div>
        <div class="mt-4 sm:mt-0 flex space-x-4">
          <button
            (click)="openUserSearchModal()"
            style="border-radius: 24px;"
            class="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium text-white bg-gray-500 hover:bg-gray-600 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
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
            class="inline-flex items-center px-6 py-3 border border-gray-400/30 text-sm font-medium text-gray-300 bg-gray-800/50 hover:bg-gray-700 hover:text-white hover:border-gray-300 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
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

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div
          class="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700/50 p-6"
        >
          <div class="flex items-center">
            <div class="flex-shrink-0">
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                ></path>
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-slate-400">Total</p>
              <p class="text-lg font-semibold text-white">{{ userStats?.total || 0 }}</p>
            </div>
          </div>
        </div>

        <div
          class="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700/50 p-6"
        >
          <div class="flex items-center">
            <div class="flex-shrink-0">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-slate-400">Activos</p>
              <p class="text-lg font-semibold text-green-600">{{ userStats?.active || 0 }}</p>
            </div>
          </div>
        </div>

        <div
          class="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700/50 p-6"
        >
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg
                class="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                ></path>
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-slate-400">Normales</p>
              <p class="text-lg font-semibold text-white">{{ userStats?.byRole?.user || 0 }}</p>
            </div>
          </div>
        </div>

        <div
          class="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700/50 p-6"
        >
          <div class="flex items-center">
            <div class="flex-shrink-0">
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
            <div class="ml-3">
              <p class="text-sm font-medium text-slate-400">VIP</p>
              <p class="text-lg font-semibold text-yellow-600">{{ userStats?.byRole?.vip || 0 }}</p>
            </div>
          </div>
        </div>
      </div>

      <div
        class="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700/50 p-8"
      >
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-white mb-2"> Buscar usuarios </label>
            <input
              [(ngModel)]="searchTerm"
              (input)="filterUsers()"
              type="text"
              placeholder="Nombre o email..."
              class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-white placeholder-slate-400 focus:outline-none focus:ring-violet-500 focus:border-violet-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-white mb-2"> Rol </label>
            <select
              [(ngModel)]="roleFilter"
              (change)="filterUsers()"
              class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-violet-500 focus:border-violet-500"
            >
              <option value="">Todos los roles</option>
              <option value="user">Usuario Normal</option>
              <option value="vip">Usuario VIP</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-white mb-2"> Estado </label>
            <select
              [(ngModel)]="statusFilter"
              (change)="filterUsers()"
              class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-violet-500 focus:border-violet-500"
            >
              <option value="">Todos los estados</option>
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>
        </div>
      </div>

      <div
        class="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700/50 overflow-hidden"
      >
        <div class="px-8 py-6 border-b border-slate-700/50">
          <h3 class="text-xl font-semibold text-white">Usuarios ({{ filteredUsers.length }})</h3>
        </div>

        <div *ngIf="loading" class="p-8 text-center">
          <div class="inline-flex items-center">
            <svg
              class="animate-spin -ml-1 mr-3 h-5 w-5 text-violet-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Cargando usuarios...
          </div>
        </div>

        <div *ngIf="!loading" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-slate-700/50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider"
                >
                  Usuario
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider"
                >
                  Email
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider"
                >
                  Rol
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider"
                >
                  Estado
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider"
                >
                  Registro
                </th>
                <th
                  class="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="bg-slate-800/50 divide-y divide-slate-700/50">
              <tr
                *ngFor="let user of filteredUsers"
                class="hover:bg-slate-700/50 transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div
                        class="h-10 w-10 rounded-full flex items-center justify-center"
                        [class]="user.role === 'vip' ? 'bg-yellow-100' : 'bg-blue-100'"
                      >
                        <span
                          [class]="user.role === 'vip' ? 'text-yellow-600' : 'text-blue-600'"
                          class="font-medium"
                        >
                          {{ user.username.charAt(0).toUpperCase() }}
                        </span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-white flex items-center">
                        {{ user.username }}
                        <svg
                          *ngIf="user.role === 'vip'"
                          class="w-4 h-4 ml-2 text-yellow-500"
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
                      <div class="text-sm text-slate-300">ID: {{ user._id.slice(-8) }}</div>
                    </div>
                  </div>
                </td>

                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-white">{{ user.email }}</div>
                </td>

                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    [class]="getRoleClass(user.role)"
                    class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  >
                    {{ getRoleText(user.role) }}
                  </span>
                </td>

                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    [class]="getStatusClass(user.isActive)"
                    class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  >
                    {{ user.isActive ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>

                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-white">
                    {{ formatDate(user.createdAt) }}
                  </div>
                  <div class="text-sm text-slate-300">
                    {{ getTimeAgo(user.createdAt) }}
                  </div>
                </td>

                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end space-x-2">
                    <button
                      (click)="viewUser(user)"
                      class="text-violet-600 hover:text-violet-900 p-1 rounded"
                      title="Ver detalles"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        ></path>
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        ></path>
                      </svg>
                    </button>

                    <button
                      *ngIf="user.role === 'user'"
                      (click)="promoteToVip(user)"
                      class="text-yellow-600 hover:text-yellow-900 p-1 rounded"
                      title="Promocionar a VIP"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                        ></path>
                      </svg>
                    </button>

                    <button
                      *ngIf="user.role === 'vip'"
                      (click)="demoteFromVip(user)"
                      class="text-gray-600 hover:text-gray-900 p-1 rounded"
                      title="Degradar a Usuario Normal"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        ></path>
                      </svg>
                    </button>

                    <button
                      *ngIf="user.isActive"
                      (click)="deactivateUser(user)"
                      class="text-red-600 hover:text-red-900 p-1 rounded"
                      title="Desactivar usuario"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                    </button>

                    <button
                      *ngIf="!user.isActive"
                      (click)="activateUser(user)"
                      class="text-green-600 hover:text-green-900 p-1 rounded"
                      title="Activar usuario"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div *ngIf="filteredUsers.length === 0 && !loading" class="text-center py-12">
            <svg
              class="w-16 h-16 mx-auto mb-4 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              ></path>
            </svg>
            <h3 class="text-lg font-medium text-white mb-2">No hay usuarios</h3>
            <p class="text-slate-300">
              {{
                searchTerm || roleFilter || statusFilter
                  ? 'No se encontraron usuarios con los filtros aplicados.'
                  : 'No hay usuarios registrados en el sistema.'
              }}
            </p>
          </div>
        </div>
      </div>

      <div
        *ngIf="showUserSearchModal"
        class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      >
        <div
          class="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-slate-800 border-slate-700"
        >
          <div class="flex items-center justify-between pb-3">
            <h3 class="text-lg font-bold text-white">Buscar Usuario para Promocionar a VIP</h3>
            <button (click)="closeUserSearchModal()" class="text-slate-400 hover:text-white">
              <span class="text-2xl">&times;</span>
            </button>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-white mb-2">
              Buscar por nombre o email
            </label>
            <input
              [(ngModel)]="searchTermModal"
              (input)="searchUsersModal()"
              type="text"
              placeholder="Escribe para buscar usuarios..."
              class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-violet-500 focus:border-violet-500"
            />
          </div>

          <div
            *ngIf="searchResultsModal.length > 0"
            class="max-h-64 overflow-y-auto border border-slate-600 rounded-md bg-slate-700/50"
          >
            <div
              *ngFor="let user of searchResultsModal"
              class="p-3 border-b border-slate-600 hover:bg-slate-600 cursor-pointer flex items-center justify-between"
            >
              <div>
                <div class="font-medium text-white">{{ user.username }}</div>
                <div class="text-sm text-slate-300">{{ user.email }}</div>
                <div class="text-xs">
                  <span [class]="getRoleClass(user.role)">{{ getRoleText(user.role) }}</span>
                </div>
              </div>
              <button
                (click)="selectUser(user)"
                class="px-3 py-1 bg-violet-600 text-white rounded-md hover:bg-violet-700"
              >
                Seleccionar
              </button>
            </div>
          </div>

          <div
            *ngIf="searchTermModal && searchResultsModal.length === 0"
            class="text-center py-8 text-slate-300"
          >
            No se encontraron usuarios con ese criterio
          </div>

          <div *ngIf="!searchTermModal" class="text-center py-8 text-slate-300">
            Escribe el nombre o email del usuario que quieres promocionar a VIP
          </div>
        </div>
      </div>

      <div
        *ngIf="showPromoteModal"
        class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
        (click)="closePromoteModal()"
      >
        <div
          class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-slate-800 border-slate-700"
          (click)="$event.stopPropagation()"
        >
          <div class="mt-3 text-center">
            <div
              class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-900/20 border border-yellow-600/30"
            >
              <svg
                class="w-8 h-8 text-yellow-500"
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

            <h3 class="text-lg font-medium text-white mt-4">Promocionar a VIP</h3>

            <div class="mt-2 px-7 py-3">
              <p class="text-sm text-slate-300 mb-4">
                ¿Estás seguro de que quieres promocionar a
                <strong class="text-white">{{ selectedUser?.username }}</strong> a usuario VIP?
              </p>

              <div class="mb-4">
                <label class="block text-sm font-medium text-white mb-2 text-left">
                  Razón de la promoción
                </label>
                <input
                  [(ngModel)]="promoteReason"
                  type="text"
                  placeholder="Ej: Usuario muy activo"
                  class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium text-white mb-2 text-left">
                  Notas adicionales
                </label>
                <textarea
                  [(ngModel)]="promoteNotes"
                  rows="3"
                  placeholder="Notas opcionales..."
                  class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                ></textarea>
              </div>
            </div>

            <div class="flex justify-center space-x-4 px-4 py-3">
              <button
                (click)="closePromoteModal()"
                class="px-4 py-2 border border-slate-600 text-slate-300 text-base font-medium rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                Cancelar
              </button>
              <button
                (click)="confirmPromoteToVip()"
                [disabled]="!promoteReason"
                class="px-4 py-2 bg-yellow-600 text-white text-base font-medium rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Promocionar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class UsersListComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  userStats: UserStats | null = null;
  loading = true;

  searchTerm = '';
  roleFilter = '';
  statusFilter = '';

  showPromoteModal = false;
  selectedUser: User | null = null;
  promoteReason = '';
  promoteNotes = '';

  showUserSearchModal = false;
  searchTermModal = '';
  searchResultsModal: User[] = [];

  constructor(
    private adminService: AdminService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadUsers();
    this.loadUserStats();

    this.route.queryParams.subscribe((params) => {
      if (params['action'] === 'promote') {
        setTimeout(() => {
          alert(
            '💡 Tip: Haz clic en el botón ⭐ junto a cualquier usuario para promocionarlo a VIP'
          );
        }, 1000);
      }
    });
  }

  loadUsers() {
    this.loading = true;
    this.adminService.getUsers().subscribe({
      next: (response) => {
        this.users = response.users;
        this.filteredUsers = [...this.users];
        this.loading = false;

        setTimeout(() => {
          this.cdr.detectChanges();
        }, 100);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadUserStats() {
    this.adminService.getUserStats().subscribe({
      next: (response) => {
        this.userStats = response.stats;

        setTimeout(() => {
          this.cdr.detectChanges();
        }, 100);
      },
      error: (error) => {
        console.error('Error loading user stats:', error);
        this.cdr.detectChanges();
      },
    });
  }

  filterUsers() {
    this.filteredUsers = this.users.filter((user) => {
      const matchesSearch =
        !this.searchTerm ||
        user.username.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesRole = !this.roleFilter || user.role === this.roleFilter;

      const matchesStatus = !this.statusFilter || user.isActive.toString() === this.statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }

  refreshData() {
    this.loadUsers();
    this.loadUserStats();
  }

  viewUser(user: User) {
    // Ver detalles del usuario
  }

  openUserSearchModal() {
    this.showUserSearchModal = true;
    this.searchTermModal = '';
    this.searchResultsModal = [];
  }

  closeUserSearchModal() {
    this.showUserSearchModal = false;
    this.searchTermModal = '';
    this.searchResultsModal = [];
  }

  searchUsersModal() {
    if (this.searchTermModal.length < 2) {
      this.searchResultsModal = [];
      return;
    }

    this.searchResultsModal = this.users.filter(
      (user: any) =>
        (user.username.toLowerCase().includes(this.searchTermModal.toLowerCase()) ||
          user.email.toLowerCase().includes(this.searchTermModal.toLowerCase())) &&
        user.role !== 'vip'
    );
  }

  selectUser(user: User) {
    this.selectedUser = user;
    this.showUserSearchModal = false;
    this.showPromoteModal = true;
    this.promoteReason = '';
    this.promoteNotes = '';
  }

  promoteToVip(user: User) {
    this.selectedUser = user;
    this.promoteReason = '';
    this.promoteNotes = '';
    this.showPromoteModal = true;
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

    this.adminService.promoteToVip(this.selectedUser._id, data).subscribe({
      next: (response) => {
        // Usuario promocionado exitosamente
        this.closePromoteModal();
        this.refreshData();
        alert(`✅ ${this.selectedUser?.username} ha sido promocionado a VIP exitosamente`);
      },
      error: (error) => {
        console.error('Error promoting user:', error);
        alert('❌ Error al promocionar usuario: ' + (error.error?.message || error.message));
      },
    });
  }

  demoteFromVip(user: User) {
    if (
      confirm(`¿Estás seguro de que quieres degradar a ${user.username} de VIP a usuario normal?`)
    ) {
      const data = {
        reason: 'Degradación administrativa',
        notes: 'Degradado desde panel de administración',
      };

      this.adminService.demoteFromVip(user._id, data).subscribe({
        next: (response) => {
          // Usuario degradado exitosamente
          this.refreshData();
        },
        error: (error) => {
          console.error('Error demoting user:', error);
        },
      });
    }
  }

  activateUser(user: User) {
    // Activar usuario
  }

  deactivateUser(user: User) {
    if (confirm(`¿Estás seguro de que quieres desactivar a ${user.username}?`)) {
      // Desactivar usuario
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

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Hace 1 día';
    if (diffDays < 30) return `Hace ${diffDays} días`;
    if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
    return `Hace ${Math.floor(diffDays / 365)} años`;
  }

  getRoleClass(role: string): string {
    return role === 'vip' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800';
  }

  getRoleText(role: string): string {
    return role === 'vip' ? 'VIP' : 'Usuario';
  }

  getStatusClass(isActive: boolean): string {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  }
}
