import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Configuración del Sistema</h1>
          <p class="mt-2 text-sm text-gray-700">
            Panel de administración avanzada (Solo SUPER_ADMIN)
          </p>
        </div>
        <div class="mt-4 sm:mt-0">
          <span
            class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
          >
            🔒 Acceso Restringido
          </span>
        </div>
      </div>

      <!-- Información del Sistema -->
      <div class="bg-white shadow rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Información del Sistema</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Estado de Servicios -->
          <div>
            <h4 class="text-sm font-medium text-gray-700 mb-3">Estado de Microservicios</h4>
            <div class="space-y-2">
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center">
                  <span class="w-3 h-3 bg-green-400 rounded-full mr-3"></span>
                  <span class="text-sm font-medium">Admin Service</span>
                </div>
                <span class="text-xs text-gray-500">Puerto 3003</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center">
                  <span class="w-3 h-3 bg-green-400 rounded-full mr-3"></span>
                  <span class="text-sm font-medium">User Service</span>
                </div>
                <span class="text-xs text-gray-500">Puerto 3001</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center">
                  <span class="w-3 h-3 bg-yellow-400 rounded-full mr-3"></span>
                  <span class="text-sm font-medium">RabbitMQ</span>
                </div>
                <span class="text-xs text-gray-500">Mock Mode</span>
              </div>
            </div>
          </div>

          <!-- Estadísticas Generales -->
          <div>
            <h4 class="text-sm font-medium text-gray-700 mb-3">Estadísticas Generales</h4>
            <div class="space-y-2">
              <div class="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span class="text-sm text-gray-600">Total Eventos</span>
                <span class="text-sm font-medium">{{ systemStats.totalEvents || 0 }}</span>
              </div>
              <div class="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span class="text-sm text-gray-600">Total Usuarios</span>
                <span class="text-sm font-medium">{{ systemStats.totalUsers || 0 }}</span>
              </div>
              <div class="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span class="text-sm text-gray-600">Total Venues</span>
                <span class="text-sm font-medium">{{ systemStats.totalVenues || 0 }}</span>
              </div>
              <div class="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span class="text-sm text-gray-600">Usuarios VIP</span>
                <span class="text-sm font-medium text-yellow-600">{{
                  systemStats.vipUsers || 0
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Gestión de Administradores -->
      <div class="bg-white shadow rounded-lg p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">Gestión de Administradores</h3>
          <button
            (click)="openCreateAdminModal()"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700"
          >
            <span class="mr-2">➕</span>
            Crear Admin
          </button>
        </div>

        <!-- Lista de Administradores -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Administrador
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Email
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Rol
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Estado
                </th>
                <th
                  class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let admin of admins" class="hover:bg-gray-50">
                <!-- Administrador -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div
                        class="h-10 w-10 rounded-full flex items-center justify-center"
                        [class]="admin.role === 'SUPER_ADMIN' ? 'bg-red-100' : 'bg-violet-100'"
                      >
                        <span
                          [class]="
                            admin.role === 'SUPER_ADMIN' ? 'text-red-600' : 'text-violet-600'
                          "
                          class="font-medium"
                        >
                          {{ admin.firstName?.charAt(0) || 'A'
                          }}{{ admin.lastName?.charAt(0) || 'D' }}
                        </span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">
                        {{ admin.firstName }} {{ admin.lastName }}
                      </div>
                      <div class="text-sm text-gray-500">ID: {{ admin.id?.slice(-8) }}</div>
                    </div>
                  </div>
                </td>

                <!-- Email -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ admin.email }}</div>
                </td>

                <!-- Rol -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    [class]="getAdminRoleClass(admin.role)"
                    class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  >
                    {{ admin.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin' }}
                  </span>
                </td>

                <!-- Estado -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    [class]="getAdminStatusClass(admin.isActive)"
                    class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  >
                    {{ admin.isActive ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>

                <!-- Acciones -->
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end space-x-2">
                    <!-- Editar -->
                    <button
                      (click)="editAdmin(admin)"
                      class="text-blue-600 hover:text-blue-900 p-1 rounded"
                      title="Editar admin"
                    >
                      ✏️
                    </button>

                    <!-- Activar/Desactivar -->
                    <button
                      *ngIf="admin.isActive && admin.id !== currentUserId"
                      (click)="deactivateAdmin(admin)"
                      class="text-yellow-600 hover:text-yellow-900 p-1 rounded"
                      title="Desactivar admin"
                    >
                      ⏸️
                    </button>

                    <button
                      *ngIf="!admin.isActive"
                      (click)="activateAdmin(admin)"
                      class="text-green-600 hover:text-green-900 p-1 rounded"
                      title="Activar admin"
                    >
                      ▶️
                    </button>

                    <!-- Eliminar -->
                    <button
                      *ngIf="admin.id !== currentUserId"
                      (click)="deleteAdmin(admin)"
                      class="text-red-600 hover:text-red-900 p-1 rounded"
                      title="Eliminar admin"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Logs del Sistema -->
      <div class="bg-white shadow rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Logs del Sistema</h3>
        <div class="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto">
          <div class="font-mono text-sm text-green-400 space-y-1">
            <div *ngFor="let log of systemLogs" class="flex">
              <span class="text-gray-500 mr-2">{{ log.timestamp }}</span>
              <span [class]="getLogLevelClass(log.level)">{{ log.level }}</span>
              <span class="ml-2 text-gray-300">{{ log.message }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Acciones del Sistema -->
      <div class="bg-white shadow rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Acciones del Sistema</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            (click)="clearLogs()"
            class="flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <span class="mr-2">🧹</span>
            Limpiar Logs
          </button>

          <button
            (click)="exportData()"
            class="flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <span class="mr-2">📊</span>
            Exportar Datos
          </button>

          <button
            (click)="restartServices()"
            class="flex items-center justify-center px-4 py-3 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
          >
            <span class="mr-2">🔄</span>
            Reiniciar Servicios
          </button>
        </div>
      </div>

      <!-- Modal de creación de admin -->
      <div
        *ngIf="showAdminModal"
        class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
        (click)="closeAdminModal()"
      >
        <div
          class="relative top-10 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white"
          (click)="$event.stopPropagation()"
        >
          <div class="mt-3">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900">
                {{ isEditingAdmin ? 'Editar Administrador' : 'Crear Nuevo Administrador' }}
              </h3>
              <button (click)="closeAdminModal()" class="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <form (ngSubmit)="saveAdmin()" class="space-y-4">
              <!-- Nombre -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"> Nombre * </label>
                <input
                  [(ngModel)]="adminForm.firstName"
                  name="firstName"
                  type="text"
                  required
                  placeholder="Nombre del administrador"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500"
                />
              </div>

              <!-- Apellido -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"> Apellido * </label>
                <input
                  [(ngModel)]="adminForm.lastName"
                  name="lastName"
                  type="text"
                  required
                  placeholder="Apellido del administrador"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500"
                />
              </div>

              <!-- Email -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"> Email * </label>
                <input
                  [(ngModel)]="adminForm.email"
                  name="email"
                  type="email"
                  required
                  placeholder="admin@ticketing.com"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500"
                />
              </div>

              <!-- Password (solo para crear) -->
              <div *ngIf="!isEditingAdmin">
                <label class="block text-sm font-medium text-gray-700 mb-2"> Contraseña * </label>
                <input
                  [(ngModel)]="adminForm.password"
                  name="password"
                  type="password"
                  required
                  placeholder="Contraseña segura"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500"
                />
              </div>

              <!-- Rol -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"> Rol * </label>
                <select
                  [(ngModel)]="adminForm.role"
                  name="role"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500"
                >
                  <option value="ADMIN">Administrador</option>
                  <option value="SUPER_ADMIN">Super Administrador</option>
                </select>
              </div>

              <!-- Botones -->
              <div class="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  (click)="closeAdminModal()"
                  class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  [disabled]="!isAdminFormValid()"
                  class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ isEditingAdmin ? 'Actualizar' : 'Crear' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class SettingsComponent implements OnInit {
  admins: any[] = [];
  systemStats: any = {};
  systemLogs: any[] = [];
  currentUserId: string = '';

  // Modal de admin
  showAdminModal = false;
  isEditingAdmin = false;
  adminForm: any = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'ADMIN',
  };

  constructor(private adminService: AdminService, private authService: AuthService) {}

  ngOnInit() {
    this.loadSystemData();
    this.loadAdmins();
    this.generateMockLogs();

    // Obtener ID del usuario actual
    this.authService.currentUser$.subscribe((user) => {
      this.currentUserId = user?.id || '';
    });
  }

  loadSystemData() {
    // Cargar estadísticas del sistema
    this.systemStats = {
      totalEvents: 6,
      totalUsers: 3,
      totalVenues: 4,
      vipUsers: 1,
    };
  }

  loadAdmins() {
    // TODO: Implementar carga real de administradores
    this.admins = [
      {
        id: '467a0b9f-5cd9-46b0-8905-621bc92a8664',
        firstName: 'Admin',
        lastName: 'Principal',
        email: 'admin@ticketing.com',
        role: 'ADMIN',
        isActive: true,
      },
      {
        id: '26fa8809-a1a4-4242-9d09-42e65e5ee368',
        firstName: 'Voro',
        lastName: 'SuperAdmin',
        email: 'voro.super@ticketing.com',
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    ];
  }

  generateMockLogs() {
    const now = new Date();
    this.systemLogs = [
      {
        timestamp: now.toLocaleTimeString(),
        level: 'INFO',
        message: 'Admin service started on port 3003',
      },
      {
        timestamp: new Date(now.getTime() - 60000).toLocaleTimeString(),
        level: 'INFO',
        message: 'User service started on port 3001',
      },
      {
        timestamp: new Date(now.getTime() - 120000).toLocaleTimeString(),
        level: 'WARN',
        message: 'RabbitMQ running in mock mode',
      },
      {
        timestamp: new Date(now.getTime() - 180000).toLocaleTimeString(),
        level: 'INFO',
        message: 'Database connections established',
      },
      {
        timestamp: new Date(now.getTime() - 240000).toLocaleTimeString(),
        level: 'INFO',
        message: 'Usuario Xavi promocionado a VIP',
      },
    ];
  }

  // Gestión de administradores
  openCreateAdminModal() {
    this.isEditingAdmin = false;
    this.adminForm = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'ADMIN',
    };
    this.showAdminModal = true;
  }

  editAdmin(admin: any) {
    this.isEditingAdmin = true;
    this.adminForm = { ...admin };
    this.showAdminModal = true;
  }

  closeAdminModal() {
    this.showAdminModal = false;
    this.isEditingAdmin = false;
  }

  saveAdmin() {
    if (!this.isAdminFormValid()) return;

    console.log('Guardar admin:', this.adminForm);
    // TODO: Implementar guardado real
    this.closeAdminModal();
    this.loadAdmins();
  }

  isAdminFormValid(): boolean {
    const form = this.adminForm;
    return !!(
      form.firstName &&
      form.lastName &&
      form.email &&
      form.role &&
      (this.isEditingAdmin || form.password)
    );
  }

  activateAdmin(admin: any) {
    console.log('Activar admin:', admin);
    // TODO: Implementar activación
  }

  deactivateAdmin(admin: any) {
    if (
      confirm(`¿Estás seguro de que quieres desactivar a ${admin.firstName} ${admin.lastName}?`)
    ) {
      console.log('Desactivar admin:', admin);
      // TODO: Implementar desactivación
    }
  }

  deleteAdmin(admin: any) {
    if (
      confirm(
        `¿Estás seguro de que quieres eliminar a ${admin.firstName} ${admin.lastName}? Esta acción no se puede deshacer.`
      )
    ) {
      console.log('Eliminar admin:', admin);
      // TODO: Implementar eliminación
    }
  }

  // Acciones del sistema
  clearLogs() {
    if (confirm('¿Estás seguro de que quieres limpiar todos los logs?')) {
      this.systemLogs = [];
    }
  }

  exportData() {
    console.log('Exportar datos del sistema');
    // TODO: Implementar exportación
  }

  restartServices() {
    if (
      confirm(
        '¿Estás seguro de que quieres reiniciar los servicios? Esto puede causar interrupciones temporales.'
      )
    ) {
      console.log('Reiniciar servicios');
      // TODO: Implementar reinicio
    }
  }

  // Utilidades
  getAdminRoleClass(role: string): string {
    return role === 'SUPER_ADMIN' ? 'bg-red-100 text-red-800' : 'bg-violet-100 text-violet-800';
  }

  getAdminStatusClass(isActive: boolean): string {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  }

  getLogLevelClass(level: string): string {
    switch (level) {
      case 'ERROR':
        return 'text-red-400';
      case 'WARN':
        return 'text-yellow-400';
      case 'INFO':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  }
}
