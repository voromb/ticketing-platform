import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AdminService, User, UserStats } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-8 pb-16 space-y-8">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 class="text-2xl font-bold text-white">Gestión de Usuarios</h1>
          <p class="mt-2 text-sm text-slate-300">Administra usuarios y promociones VIP</p>
        </div>
        <div class="mt-4 sm:mt-0 flex flex-wrap gap-4">
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
            Buscar usuarios
          </button>
          <button
            (click)="openVipPromotionModal()"
            style="border-radius: 24px;"
            class="bg-yellow-400 hover:bg-yellow-500 text-white px-6 py-3 font-medium transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <svg
              class="w-5 h-5 inline-block mr-2"
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
            Promocionar VIP
          </button>
          <button
            *ngIf="isSuperAdmin"
            (click)="openAdminPromotionModal()"
            style="border-radius: 24px;"
            class="bg-red-400 hover:bg-red-500 text-white px-6 py-3 font-medium transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <svg
              class="w-5 h-5 inline-block mr-2"
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
            Promocionar Admin
          </button>
          <button
            *ngIf="isSuperAdmin"
            (click)="openDemoteAdminModal()"
            style="border-radius: 24px;"
            class="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 font-medium transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <svg
              class="w-5 h-5 inline-block mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
              ></path>
            </svg>
            Degradar Admin
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

        <div
          class="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700/50 p-6"
        >
          <div class="flex items-center">
            <div class="flex-shrink-0">
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
            <div class="ml-3">
              <p class="text-sm font-medium text-slate-400">Admins</p>
              <p class="text-lg font-semibold text-red-600">{{ (userStats?.byRole?.admin || 0) + (userStats?.byRole?.super_admin || 0) }}</p>
            </div>
          </div>
        </div>

        <div
          class="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700/50 p-6"
        >
          <div class="flex items-center">
            <div class="flex-shrink-0">
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
            <div class="ml-3">
              <p class="text-sm font-medium text-slate-400">Gestores</p>
              <p class="text-lg font-semibold text-emerald-600">{{ userStats?.byRole?.company_admin || 0 }}</p>
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
              <option value="COMPANY_ADMIN">Gestor de Servicios</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
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
                class="px-4 py-2 bg-yellow-400 text-white text-base font-medium rounded-md hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Promocionar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Promoción a Admin -->
      <div
        *ngIf="showAdminPromotionModal"
        class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
        (click)="closeAdminPromotionModal()"
      >
        <div
          class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-slate-800 border-slate-700"
          (click)="$event.stopPropagation()"
        >
          <div class="mt-3 text-center">
            <div
              class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4"
            >
              <svg
                class="h-6 w-6 text-red-600"
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
            <h3 class="text-lg leading-6 font-medium text-white mb-4">
              Promocionar a Company Admin
            </h3>
            <p class="text-sm text-slate-400 mb-4">
              Asigna un usuario como administrador de una compañía de servicios (Restaurantes, Viajes o Merchandising)
            </p>

            <div class="mt-2 text-left">
              <!-- Búsqueda de usuario -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-slate-300 mb-2">Buscar Usuario</label>
                <input
                  type="text"
                  [(ngModel)]="adminSearchTerm"
                  (input)="searchUsersForAdmin()"
                  placeholder="Buscar por nombre o email..."
                  class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-red-500 focus:border-red-500"
                />

                <!-- Resultados de búsqueda -->
                <div
                  *ngIf="adminSearchResults.length > 0"
                  class="mt-2 max-h-32 overflow-y-auto bg-slate-700 border border-slate-600 rounded-md"
                >
                  <div
                    *ngFor="let user of adminSearchResults"
                    (click)="selectUserForAdmin(user)"
                    class="px-3 py-2 hover:bg-slate-600 cursor-pointer text-white border-b border-slate-600 last:border-b-0"
                  >
                    <div class="font-medium">{{ user.username }}</div>
                    <div class="text-sm text-slate-400">{{ user.email }}</div>
                  </div>
                </div>
              </div>

              <!-- Usuario seleccionado -->
              <div *ngIf="selectedUserForAdmin" class="mb-4 p-3 bg-slate-700 rounded-md">
                <div class="text-sm text-slate-300">Usuario seleccionado:</div>
                <div class="font-medium text-white">{{ selectedUserForAdmin.username }}</div>
                <div class="text-sm text-slate-400">{{ selectedUserForAdmin.email }}</div>
              </div>

              <!-- Tipo de Administrador -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-slate-300 mb-2"
                  >Tipo de Administrador *</label
                >
                <select
                  [(ngModel)]="selectedCompanyType"
                  class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-red-500 focus:border-red-500"
                >
                  <option value="RESTAURANT">Administrador de Restaurantes</option>
                  <option value="TRAVEL">Administrador de Viajes</option>
                  <option value="MERCHANDISING">Administrador de Merchandising</option>
                </select>
              </div>

              <!-- Región -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-slate-300 mb-2"
                  >Región *</label
                >
                <select
                  [(ngModel)]="selectedRegion"
                  class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-red-500 focus:border-red-500"
                >
                  <option value="SPAIN">🇪🇸 España</option>
                  <option value="EUROPE">🇪🇺 Europa</option>
                </select>
              </div>

              <!-- Nombre de Compañía -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-slate-300 mb-2"
                  >Nombre de la Compañía *</label
                >
                <input
                  type="text"
                  [(ngModel)]="companyName"
                  placeholder="Ej: Restaurantes Gourmet S.L."
                  class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            <div class="flex justify-center space-x-4 px-4 py-3">
              <button
                (click)="closeAdminPromotionModal()"
                class="px-4 py-2 border border-slate-600 text-slate-300 text-base font-medium rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                Cancelar
              </button>
              <button
                (click)="confirmPromoteToAdmin()"
                [disabled]="!selectedUserForAdmin || !companyName"
                class="px-4 py-2 bg-red-400 text-white text-base font-medium rounded-md hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Promocionar a Company Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Detalles de Usuario -->
    <div
      *ngIf="showUserModal && selectedUser"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div
        class="bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden"
      >
        <!-- Header del Modal -->
        <div class="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <div>
            <h3 class="text-lg font-medium text-white">Detalles del Usuario</h3>
            <p class="text-sm text-slate-300">{{ selectedUser.email }}</p>
          </div>
          <button (click)="closeUserModal()" class="text-slate-400 hover:text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <!-- Contenido del Modal -->
        <div class="p-6 overflow-y-auto max-h-[70vh]">
          <!-- Información Personal -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div class="bg-slate-700/30 rounded-lg p-4">
              <h4 class="text-sm font-medium text-slate-300 mb-3">Información Personal</h4>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-slate-400">Usuario:</span>
                  <span class="text-white">{{ selectedUser.username }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">Email:</span>
                  <span class="text-white">{{ selectedUser.email }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">ID:</span>
                  <span class="text-white text-xs">{{ selectedUser._id }}</span>
                </div>
              </div>
            </div>

            <div class="bg-slate-700/30 rounded-lg p-4">
              <h4 class="text-sm font-medium text-slate-300 mb-3">Estado de la Cuenta</h4>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-slate-400">Rol:</span>
                  <span
                    [class]="getRoleBadgeClass(selectedUser.role)"
                    class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  >
                    {{ getRoleDisplayName(selectedUser.role) }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">Estado:</span>
                  <span [class]="selectedUser.isActive ? 'text-green-400' : 'text-red-400'">
                    {{ selectedUser.isActive ? 'Activo' : 'Inactivo' }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">Registro:</span>
                  <span class="text-white">{{ formatDate(selectedUser.createdAt) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">Última actualización:</span>
                  <span class="text-white">{{ formatDate(selectedUser.updatedAt) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Información Adicional -->
          <div class="bg-slate-700/30 rounded-lg p-4 mb-6">
            <h4 class="text-sm font-medium text-slate-300 mb-3">Información del Sistema</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex justify-between">
                <span class="text-slate-400">Tipo de cuenta:</span>
                <span class="text-white">{{
                  selectedUser.role === 'vip' ? 'VIP Premium' : 'Usuario Estándar'
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Estado de actividad:</span>
                <span [class]="selectedUser.isActive ? 'text-green-400' : 'text-red-400'">
                  {{ selectedUser.isActive ? 'Cuenta Activa' : 'Cuenta Inactiva' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Estadísticas del Usuario -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-slate-700/30 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-blue-400">{{ getUserTicketsPurchased() }}</div>
              <div class="text-sm text-slate-300">Entradas Compradas</div>
            </div>
            <div class="bg-slate-700/30 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-green-400">{{ getUserEventsAttended() }}</div>
              <div class="text-sm text-slate-300">Eventos Asistidos</div>
            </div>
            <div class="bg-slate-700/30 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-yellow-400">€{{ getUserTotalSpent() }}</div>
              <div class="text-sm text-slate-300">Total Gastado</div>
            </div>
          </div>
        </div>

        <!-- Footer del Modal -->
        <div class="px-6 py-4 border-t border-slate-700 flex justify-end">
          <button
            (click)="closeUserModal()"
            class="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700"
          >
            Cerrar
          </button>
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

  // Modal de detalles de usuario
  showUserModal = false;

  showUserSearchModal = false;
  searchTermModal = '';
  searchResultsModal: User[] = [];

  // Admin promotion modal
  showAdminPromotionModal = false;
  adminSearchTerm = '';
  adminSearchResults: User[] = [];
  selectedUserForAdmin: User | null = null;
  adminPromotionReason = '';
  adminPromotionNotes = '';
  selectedCompanyType = 'RESTAURANT'; // RESTAURANT, TRAVEL, MERCHANDISING
  selectedRegion = 'SPAIN'; // SPAIN, EUROPE
  companyName = '';

  constructor(
    private adminService: AdminService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private http: HttpClient
  ) {}
  ngOnInit() {
    this.loadUsers();
    this.loadUserStats();

    // Debug: verificar usuario actual
    const currentUser = this.authService.getCurrentUser();
    console.log('Usuario actual en users-list:', currentUser);
    console.log('Es super admin?', this.isSuperAdmin);
    console.log('Rol del usuario:', currentUser?.role);

    this.route.queryParams.subscribe((params) => {
      if (params['action'] === 'promote') {
        setTimeout(() => {
          Swal.fire({
            position: 'top-end',
            icon: 'info',
            title: '💡 Tip de navegación',
            text: 'Haz clic en el botón ⭐ junto a cualquier usuario para promocionarlo a VIP',
            showConfirmButton: false,
            timer: 3000,
            toast: true,
          });
        }, 1000);
      }
    });
  }

  loadUsers() {
    this.loading = true;
    
    // Obtener usuarios de MongoDB
    this.adminService.getUsers().subscribe({
      next: (response) => {
        const mongoUsers = response.users;
        
        // Obtener COMPANY_ADMIN de PostgreSQL
        const token = localStorage.getItem('token');
        this.http.get<any>(`${environment.apiUrl}/user-management/company-admins`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).subscribe({
          next: (companyAdminsResponse) => {
            // Convertir COMPANY_ADMIN a formato de usuario
            const companyAdminUsers = companyAdminsResponse.companyAdmins.map((ca: any) => ({
              _id: ca.id,
              username: ca.first_name + ' ' + ca.last_name,
              email: ca.email,
              firstName: ca.first_name,
              lastName: ca.last_name,
              role: 'COMPANY_ADMIN',
              isActive: ca.is_active,
              createdAt: ca.created_at,
              updatedAt: ca.updated_at,
              companyId: ca.company_id,
              companyName: ca.companies?.name
            }));
            
            // Obtener emails de COMPANY_ADMIN para filtrar duplicados
            const companyAdminEmails = companyAdminUsers.map((ca: any) => ca.email);
            
            // Filtrar usuarios de MongoDB que NO sean COMPANY_ADMIN
            const filteredMongoUsers = mongoUsers.filter((user: any) => 
              !companyAdminEmails.includes(user.email)
            );
            
            // Combinar: usuarios de MongoDB (sin duplicados) + COMPANY_ADMIN de PostgreSQL
            this.users = [...filteredMongoUsers, ...companyAdminUsers];
            this.filteredUsers = [...this.users];
            this.loading = false;

            console.log('✅ Usuarios cargados:', this.users.length);
            console.log('📊 COMPANY_ADMIN:', companyAdminUsers.length);

            setTimeout(() => {
              this.cdr.detectChanges();
            }, 100);
          },
          error: (error) => {
            console.error('Error loading company admins:', error);
            // Si falla, al menos mostrar los usuarios de MongoDB
            this.users = mongoUsers;
            this.filteredUsers = [...this.users];
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
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

        // Obtener COMPANY_ADMIN de PostgreSQL para actualizar las estadísticas
        const token = localStorage.getItem('token');
        this.http.get<any>(`${environment.apiUrl}/user-management/company-admins`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).subscribe({
          next: (companyAdminsResponse) => {
            // Añadir el conteo de COMPANY_ADMIN a las estadísticas
            if (this.userStats) {
              if (!this.userStats.byRole) {
                this.userStats.byRole = { user: 0, vip: 0 };
              }
              this.userStats.byRole.company_admin = companyAdminsResponse.companyAdmins.length;
              
              // Actualizar el total
              this.userStats.total = (this.userStats.total || 0) + companyAdminsResponse.companyAdmins.length;
            }

            setTimeout(() => {
              this.cdr.detectChanges();
            }, 100);
          },
          error: (error) => {
            console.error('Error loading company admins stats:', error);
            setTimeout(() => {
              this.cdr.detectChanges();
            }, 100);
          }
        });
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
    Swal.fire({
      title: 'Actualizando...',
      text: 'Cargando datos actualizados',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.loadUsers();
    this.loadUserStats();

    // Cerrar el loading después de 1 segundo
    setTimeout(() => {
      Swal.close();
    }, 1000);
  }

  viewUser(user: User) {
    this.selectedUser = user;
    this.showUserModal = true;
  }

  closeUserModal() {
    this.showUserModal = false;
    this.selectedUser = null;
  }

  getUserTicketsPurchased(): number {
    return 0; // TODO: Conectar con sistema de tickets
  }

  getUserEventsAttended(): number {
    return 0; // TODO: Conectar con sistema de eventos
  }

  getUserTotalSpent(): number {
    return 0; // TODO: Conectar con sistema de ventas
  }

  getRoleDisplayName(role: string): string {
    switch (role.toLowerCase()) {
      case 'vip':
        return 'VIP';
      case 'admin':
        return 'Admin';
      case 'super_admin':
        return 'Super Admin';
      case 'company_admin':
        return 'Gestor de Servicios';
      default:
        return 'Usuario';
    }
  }

  getRoleBadgeClass(role: string): string {
    switch (role.toLowerCase()) {
      case 'vip':
        return 'bg-yellow-100 text-yellow-800';
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'super_admin':
        return 'bg-purple-100 text-purple-800';
      case 'company_admin':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: '¡Promoción exitosa!',
          text: `${this.selectedUser?.username} ha sido promocionado a VIP exitosamente`,
          showConfirmButton: false,
          timer: 2000,
          toast: true,
        });
      },
      error: (error) => {
        console.error('Error promoting user:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error al promocionar usuario',
          text: error.error?.message || error.message,
          confirmButtonText: 'Entendido',
        });
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
    switch (role?.toLowerCase()) {
      case 'vip':
        return 'bg-yellow-100 text-yellow-800';
      case 'company_admin':
        return 'bg-green-100 text-green-800';
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'super_admin':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-blue-100 text-blue-800';
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

  getStatusClass(isActive: boolean): string {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  }

  // Admin promotion methods
  get isSuperAdmin(): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser !== null && ['super_admin', 'SUPER_ADMIN'].includes(currentUser.role);
  }

  openVipPromotionModal() {
    this.showUserSearchModal = true;
    this.searchTermModal = '';
    this.searchResultsModal = [];
  }

  openAdminPromotionModal() {
    this.showAdminPromotionModal = true;
    this.adminSearchTerm = '';
    this.adminSearchResults = [];
    this.selectedUserForAdmin = null;
    this.adminPromotionReason = '';
    this.adminPromotionNotes = '';
  }

  searchUsersForAdmin() {
    if (this.adminSearchTerm.length < 2) {
      this.adminSearchResults = [];
    }

    this.adminSearchResults = this.users.filter(
      (user: any) =>
        (user.username.toLowerCase().includes(this.adminSearchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(this.adminSearchTerm.toLowerCase())) &&
        !['admin', 'super_admin', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)
    );
  }

  selectUserForAdmin(user: User) {
    this.selectedUserForAdmin = user;
    this.adminSearchTerm = user.username;
    this.adminSearchResults = [];
  }

  confirmPromoteToAdmin() {
    if (!this.selectedUserForAdmin || !this.companyName) {
      Swal.fire({
        icon: 'warning',
        title: 'Datos incompletos',
        text: 'Por favor completa todos los campos requeridos.',
        confirmButtonText: 'Entendido',
      });
      return;
    }

    const companyTypeNames: any = {
      RESTAURANT: 'Restaurantes',
      TRAVEL: 'Viajes',
      MERCHANDISING: 'Merchandising',
    };

    const regionNames: any = {
      SPAIN: 'España',
      EUROPE: 'Europa',
    };

    // Mapear tipo y región a companyId
    const companyIds: any = {
      RESTAURANT_SPAIN: 'e4431741-8685-4b0d-8363-afde158f14a3',
      RESTAURANT_EUROPE: 'f26b646d-d38c-4ee4-a43f-bb8882448bb6',
      TRAVEL_SPAIN: '2e58e5e8-e565-40a0-ba46-c5ea7fd830bd',
      TRAVEL_EUROPE: '2d14e024-2f7a-4b22-96a9-e7e5ecd8406b',
      MERCHANDISING_SPAIN: 'a1caef6a-8cb0-4c04-b95c-fd2900a20045',
      MERCHANDISING_EUROPE: '1f663db9-f05c-4c1c-b46c-54de1588d5b8',
    };

    const companyKey = `${this.selectedCompanyType}_${this.selectedRegion}`;
    const companyId = companyIds[companyKey];

    const data = {
      companyId: companyId,
      serviceType: this.selectedCompanyType,
      reason: 'Promoción desde panel de administración',
      notes: 'Promoción a Company Admin desde panel de gestión',
    };

    // Llamada real al backend
    const token = localStorage.getItem('token');
    const username = this.selectedUserForAdmin?.username || 'Usuario';
    const userId = this.selectedUserForAdmin?._id;

    if (!userId) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo obtener el ID del usuario',
        confirmButtonColor: '#ef4444',
      });
      return;
    }

    this.http
      .post(`${environment.apiUrl}/user-management/${userId}/promote-company-admin`, data, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe({
        next: (response: any) => {
          Swal.fire({
            icon: 'success',
            title: '¡Promoción exitosa!',
            html: `
            <div class="text-left">
              <p><strong>${username}</strong> ha sido promocionado a Company Admin:</p>
              <ul class="mt-2 space-y-1">
                <li><strong>Compañía:</strong> ${this.companyName}</li>
                <li><strong>Tipo:</strong> ${companyTypeNames[this.selectedCompanyType]}</li>
                <li><strong>Región:</strong> ${regionNames[this.selectedRegion]}</li>
              </ul>
              <div class="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                <p class="text-sm font-semibold text-green-800">✅ Acceso al panel:</p>
                <p class="text-sm text-green-700 mt-1"><strong>Email:</strong> ${
                  response.companyAdmin?.email || 'N/A'
                }</p>
                <p class="text-sm text-green-700"><strong>Contraseña:</strong> Su contraseña actual</p>
                <p class="text-xs text-green-600 mt-2">El usuario puede acceder al panel de ${companyTypeNames[this.selectedCompanyType]} con su email y contraseña habitual.</p>
              </div>
            </div>
          `,
            confirmButtonColor: '#ef4444',
            width: 600,
            timer: 12000,
          });
          this.closeAdminPromotionModal();
          this.refreshData();
        },
        error: (error: any) => {
          console.error('Error promocionando a Company Admin:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error en la promoción',
            text: error.error?.error || 'No se pudo promocionar el usuario a Company Admin',
            confirmButtonColor: '#ef4444',
          });
        },
      });
  }

  closeAdminPromotionModal() {
    this.showAdminPromotionModal = false;
    this.adminSearchTerm = '';
    this.adminSearchResults = [];
    this.selectedUserForAdmin = null;
    this.adminPromotionReason = '';
    this.adminPromotionNotes = '';
    this.selectedCompanyType = 'RESTAURANT';
    this.selectedRegion = 'SPAIN';
    this.companyName = '';
  }

  // ==================== DEGRADAR COMPANY_ADMIN ====================
  
  openDemoteAdminModal() {
    // Filtrar solo usuarios que son COMPANY_ADMIN
    const companyAdmins = this.users.filter((user: any) => user.role === 'COMPANY_ADMIN');
    
    if (companyAdmins.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Sin Company Admins',
        text: 'No hay usuarios con rol de Company Admin para degradar.',
        confirmButtonText: 'Entendido',
      });
      return;
    }

    // Mostrar lista de COMPANY_ADMIN para seleccionar
    const options: any = {};
    companyAdmins.forEach((admin: any) => {
      options[admin._id] = `${admin.username} (${admin.email})`;
    });

    Swal.fire({
      title: 'Degradar Company Admin',
      text: 'Selecciona el usuario que deseas degradar a usuario normal',
      input: 'select',
      inputOptions: options,
      inputPlaceholder: 'Selecciona un Company Admin',
      showCancelButton: true,
      confirmButtonText: 'Degradar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#f97316',
      inputValidator: (value) => {
        if (!value) {
          return 'Debes seleccionar un usuario';
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.confirmDemoteAdmin(result.value);
      }
    });
  }

  confirmDemoteAdmin(companyAdminId: string) {
    const admin = this.users.find((u: any) => u._id === companyAdminId);
    
    if (!admin) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se encontró el usuario seleccionado',
      });
      return;
    }

    Swal.fire({
      title: '¿Estás seguro?',
      html: `
        <p>Vas a degradar a <strong>${admin.username}</strong> de Company Admin a usuario normal.</p>
        <p class="text-sm text-gray-500 mt-2">Esta acción eliminará todos sus permisos administrativos.</p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f97316',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, degradar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem('token');
        
        this.http.delete(`${environment.apiUrl}/user-management/company-admins/${companyAdminId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).subscribe({
          next: (response: any) => {
            Swal.fire({
              icon: 'success',
              title: '¡Degradación exitosa!',
              text: `${admin.username} ha sido degradado a usuario normal`,
              confirmButtonColor: '#f97316',
              timer: 3000,
            });
            this.refreshData();
          },
          error: (error: any) => {
            console.error('Error degradando Company Admin:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error en la degradación',
              text: error.error?.error || 'No se pudo degradar el usuario',
              confirmButtonColor: '#f97316',
            });
          }
        });
      }
    });
  }
}
