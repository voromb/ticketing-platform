import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Approval {
  id: string;
  resourceType: 'RESTAURANT' | 'TRIP' | 'PRODUCT';
  resourceId: string;
  resourceName: string;
  companyName: string;
  requestedBy: string;
  requestedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  notes?: string;
}

@Component({
  selector: 'app-approvals-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-slate-900 p-8 pb-16">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">Aprobaciones Pendientes</h1>
        <p class="text-slate-300">Gestiona las solicitudes de aprobación de servicios</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700/50 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-slate-400">Pendientes</p>
              <p class="text-lg font-semibold text-yellow-600">{{ getPendingCount() }}</p>
            </div>
          </div>
        </div>

        <div class="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700/50 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-slate-400">Aprobadas</p>
              <p class="text-lg font-semibold text-green-600">{{ getApprovedCount() }}</p>
            </div>
          </div>
        </div>

        <div class="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700/50 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-slate-400">Rechazadas</p>
              <p class="text-lg font-semibold text-red-600">{{ getRejectedCount() }}</p>
            </div>
          </div>
        </div>

        <div class="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700/50 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-slate-400">Total</p>
              <p class="text-lg font-semibold text-white">{{ approvals.length }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700/50 p-6 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-white mb-2">Tipo de Servicio</label>
            <select
              [(ngModel)]="typeFilter"
              (change)="filterApprovals()"
              class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-violet-500 focus:border-violet-500"
            >
              <option value="">Todos</option>
              <option value="RESTAURANT">Restaurantes</option>
              <option value="TRIP">Viajes</option>
              <option value="PRODUCT">Merchandising</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-white mb-2">Estado</label>
            <select
              [(ngModel)]="statusFilter"
              (change)="filterApprovals()"
              class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-violet-500 focus:border-violet-500"
            >
              <option value="">Todos</option>
              <option value="PENDING">Pendientes</option>
              <option value="APPROVED">Aprobadas</option>
              <option value="REJECTED">Rechazadas</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-white mb-2">Buscar</label>
            <input
              [(ngModel)]="searchTerm"
              (input)="filterApprovals()"
              type="text"
              placeholder="Nombre del recurso o compañía..."
              class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-white placeholder-slate-400 focus:outline-none focus:ring-violet-500 focus:border-violet-500"
            />
          </div>
        </div>
      </div>

      <!-- Approvals Table -->
      <div class="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700/50 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-700">
            <thead class="bg-slate-700/50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Tipo</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Recurso</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Compañía</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Solicitado por</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Fecha</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Estado</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-slate-800/50 divide-y divide-slate-700">
              <tr *ngFor="let approval of filteredApprovals" class="hover:bg-slate-700/30 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <span [class]="getTypeClass(approval.resourceType)" class="px-2 py-1 text-xs font-semibold rounded-full">
                    {{ getTypeText(approval.resourceType) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-white">{{ approval.resourceName }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{{ approval.companyName }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{{ approval.requestedBy }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{{ formatDate(approval.requestedAt) }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span [class]="getStatusClass(approval.status)" class="px-2 py-1 text-xs font-semibold rounded-full">
                    {{ getStatusText(approval.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-2">
                    <button
                      *ngIf="approval.status === 'PENDING'"
                      (click)="approveRequest(approval)"
                      class="text-green-400 hover:text-green-300 transition-colors"
                      title="Aprobar"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </button>
                    <button
                      *ngIf="approval.status === 'PENDING'"
                      (click)="rejectRequest(approval)"
                      class="text-red-400 hover:text-red-300 transition-colors"
                      title="Rechazar"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                    <button
                      (click)="viewDetails(approval)"
                      class="text-blue-400 hover:text-blue-300 transition-colors"
                      title="Ver detalles"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Empty State -->
          <div *ngIf="filteredApprovals.length === 0" class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-white">No hay solicitudes</h3>
            <p class="mt-1 text-sm text-slate-400">
              {{ searchTerm || typeFilter || statusFilter ? 'No se encontraron solicitudes con los filtros aplicados.' : 'No hay solicitudes de aprobación pendientes.' }}
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ApprovalsListComponent implements OnInit {
  approvals: Approval[] = [];
  filteredApprovals: Approval[] = [];
  
  typeFilter = '';
  statusFilter = '';
  searchTerm = '';
  loading = true;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadApprovals();
  }

  loadApprovals() {
    const token = localStorage.getItem('token');
    
    this.http.get<any>('http://localhost:3003/api/approvals', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: (response) => {
        this.approvals = response.approvals;
        this.filteredApprovals = this.approvals;
        this.loading = false;
        setTimeout(() => this.cdr.detectChanges(), 100);
      },
      error: (error) => {
        console.error('Error loading approvals:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  filterApprovals() {
    this.filteredApprovals = this.approvals.filter(approval => {
      const matchesType = !this.typeFilter || approval.resourceType === this.typeFilter;
      const matchesStatus = !this.statusFilter || approval.status === this.statusFilter;
      const matchesSearch = !this.searchTerm || 
        approval.resourceName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        approval.companyName.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return matchesType && matchesStatus && matchesSearch;
    });
  }

  approveRequest(approval: Approval) {
    if (confirm(`¿Aprobar "${approval.resourceName}"?`)) {
      const token = localStorage.getItem('token');
      
      this.http.patch(`http://localhost:3003/api/approvals/${approval.id}/approve`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).subscribe({
        next: () => {
          alert('✅ Solicitud aprobada exitosamente');
          this.loadApprovals();
        },
        error: (error) => {
          console.error('Error approving:', error);
          alert('❌ Error al aprobar la solicitud');
        }
      });
    }
  }

  rejectRequest(approval: Approval) {
    const reason = prompt(`¿Rechazar "${approval.resourceName}"?\n\nMotivo del rechazo:`);
    if (reason) {
      const token = localStorage.getItem('token');
      
      this.http.patch(`http://localhost:3003/api/approvals/${approval.id}/reject`, 
        { reason }, 
        { headers: { 'Authorization': `Bearer ${token}` } }
      ).subscribe({
        next: () => {
          alert('✅ Solicitud rechazada');
          this.loadApprovals();
        },
        error: (error) => {
          console.error('Error rejecting:', error);
          alert('❌ Error al rechazar la solicitud');
        }
      });
    }
  }

  viewDetails(approval: Approval) {
    alert(`Detalles de: ${approval.resourceName}\n\nTipo: ${this.getTypeText(approval.resourceType)}\nCompañía: ${approval.companyName}\nEstado: ${this.getStatusText(approval.status)}\nSolicitado: ${this.formatDate(approval.requestedAt)}`);
  }

  getPendingCount(): number {
    return this.approvals.filter(a => a.status === 'PENDING').length;
  }

  getApprovedCount(): number {
    return this.approvals.filter(a => a.status === 'APPROVED').length;
  }

  getRejectedCount(): number {
    return this.approvals.filter(a => a.status === 'REJECTED').length;
  }

  getTypeClass(type: string): string {
    switch (type) {
      case 'RESTAURANT': return 'bg-green-100 text-green-800';
      case 'TRIP': return 'bg-blue-100 text-blue-800';
      case 'PRODUCT': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getTypeText(type: string): string {
    switch (type) {
      case 'RESTAURANT': return 'Restaurante';
      case 'TRIP': return 'Viaje';
      case 'PRODUCT': return 'Merchandising';
      default: return type;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'PENDING': return 'Pendiente';
      case 'APPROVED': return 'Aprobada';
      case 'REJECTED': return 'Rechazada';
      default: return status;
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
