import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { AdminService, type Event } from '../../../core/services/admin.service';

@Component({
  selector: 'app-events-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="p-8 pb-16 space-y-8">

      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white">Gestión de Eventos</h1>
          <p class="mt-2 text-sm text-slate-300">
            Administra todos los eventos de la plataforma
          </p>
        </div>
        <div class="mt-4 sm:mt-0">
          <button (click)="openCreateModal()"
                  style="border-radius: 24px;"
                  class="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium text-white bg-gray-700 hover:bg-gray-800 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            Crear Evento
          </button>
        </div>
      </div>

      <div class="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700/50 p-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div>
            <label class="block text-sm font-medium text-white mb-2">
              Buscar eventos
            </label>
            <input [(ngModel)]="searchTerm"
                   (input)="filterEvents()"
                   type="text"
                   placeholder="Nombre del evento..."
                   class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-white placeholder-slate-400 focus:outline-none focus:ring-violet-500 focus:border-violet-500">
          </div>

          <div>
            <label class="block text-sm font-medium text-white mb-2">
              Estado
            </label>
            <select [(ngModel)]="statusFilter"
                    (change)="filterEvents()"
                    class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-violet-500 focus:border-violet-500">
              <option value="">Todos los estados</option>
              <option value="ACTIVE">Activo</option>
              <option value="DRAFT">Borrador</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-white mb-2">
              Venue
            </label>
            <select [(ngModel)]="venueFilter"
                    (change)="filterEvents()"
                    class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-violet-500 focus:border-violet-500">
              <option value="">Todos los venues</option>
              <option *ngFor="let venue of uniqueVenues" [value]="venue.id">
                {{ venue.name }}
              </option>
            </select>
          </div>

        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700/50 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-slate-400">Total</p>
              <p class="text-lg font-semibold text-white">{{ events.length }}</p>
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
              <p class="text-sm font-medium text-slate-400">Activos</p>
              <p class="text-lg font-semibold text-green-600">{{ getEventsByStatus('ACTIVE').length }}</p>
            </div>
          </div>
        </div>

        <div class="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700/50 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-slate-400">Borradores</p>
              <p class="text-lg font-semibold text-yellow-600">{{ getEventsByStatus('DRAFT').length }}</p>
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
              <p class="text-sm font-medium text-slate-400">Cancelados</p>
              <p class="text-lg font-semibold text-red-600">{{ getEventsByStatus('CANCELLED').length }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700/50 overflow-hidden">
        <div class="px-8 py-6 border-b border-slate-700/50">
          <h3 class="text-xl font-semibold text-white">
            Eventos ({{ filteredEvents.length }})
          </h3>
        </div>

        <div *ngIf="loading" class="p-8 text-center">
          <div class="inline-flex items-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-violet-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Cargando eventos...
          </div>
        </div>

        <div *ngIf="!loading" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-slate-700/50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Evento
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Venue
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Fecha
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Estado
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Tickets
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="bg-slate-800/50 divide-y divide-slate-700/50">
              <tr *ngFor="let event of filteredEvents" class="hover:bg-slate-700/50 transition-colors">

                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div class="h-10 w-10 rounded-lg bg-violet-100 flex items-center justify-center">
                        <span class="text-violet-600 font-medium">🎵</span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-white">
                        {{ event.name }}
                      </div>
                      <div class="text-sm text-slate-300">
                        {{ event.description | slice:0:50 }}{{ event.description.length > 50 ? '...' : '' }}
                      </div>
                    </div>
                  </div>
                </td>

                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-white">{{ event.venue?.name || 'Sin venue' }}</div>
                  <div class="text-sm text-slate-300">{{ event.venue?.city || '' }}</div>
                </td>

                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-white">
                    {{ formatDate(event.eventDate) }}
                  </div>
                  <div class="text-sm text-slate-300">
                    {{ formatTime(event.eventDate) }}
                  </div>
                </td>

                <td class="px-6 py-4 whitespace-nowrap">
                  <span [class]="getStatusClass(event.status)"
                        class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                    {{ getStatusText(event.status) }}
                  </span>
                </td>

                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-white">
                    {{ event.ticketsAvailable || 0 }} disponibles
                  </div>
                  <div class="text-sm text-slate-300">
                    €{{ event.ticketPrice || 0 }}
                  </div>
                </td>

                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end space-x-2">

                    <button (click)="viewEvent(event)"
                            class="text-violet-600 hover:text-violet-900 p-1 rounded">
                      <span class="sr-only">Ver</span>
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                    </button>

                    <button (click)="editEvent(event)"
                            class="text-blue-600 hover:text-blue-900 p-1 rounded">
                      <span class="sr-only">Editar</span>
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>

                    <button *ngIf="event.status === 'DRAFT'"
                            (click)="toggleEventStatus(event)"
                            class="text-green-600 hover:text-green-900 p-1 rounded"
                            title="Activar evento (hacerlo visible)">
                      <span class="sr-only">Activar</span>
                      🟢
                    </button>

                    <button *ngIf="event.status === 'ACTIVE'"
                            (click)="toggleEventStatus(event)"
                            class="text-yellow-600 hover:text-yellow-900 p-1 rounded"
                            title="Poner en borrador (ocultar)">
                      <span class="sr-only">Desactivar</span>
                      🟡
                    </button>

                    <button (click)="deleteEvent(event)"
                            class="text-red-600 hover:text-red-900 p-1 rounded">
                      <span class="sr-only">Eliminar</span>
                      🗑️
                    </button>

                  </div>
                </td>

              </tr>
            </tbody>
          </table>

          <div *ngIf="filteredEvents.length === 0 && !loading" class="text-center py-12">
            <svg class="w-16 h-16 mx-auto mb-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
            </svg>
            <h3 class="text-lg font-medium text-white mb-2">No hay eventos</h3>
            <p class="text-slate-300 mb-4">
              {{ searchTerm || statusFilter || venueFilter ? 'No se encontraron eventos con los filtros aplicados.' : 'Comienza creando tu primer evento.' }}
            </p>
            <button *ngIf="!searchTerm && !statusFilter && !venueFilter"
                    (click)="openCreateModal()"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Crear Primer Evento
            </button>
          </div>
        </div>

      </div>

    </div>

    <div *ngIf="showModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-slate-800 border-slate-700">

        <div class="flex items-center justify-between pb-3">
          <h3 class="text-lg font-bold text-white">
            {{ isEditing ? 'Editar Evento' : 'Crear Nuevo Evento' }}
          </h3>
          <button (click)="closeModal()" class="text-slate-400 hover:text-white">
            <span class="text-2xl">&times;</span>
          </button>
        </div>

        <form (ngSubmit)="saveEvent()" class="space-y-4">

          <div>
            <label class="block text-sm font-medium text-white mb-2">
              Nombre del Evento *
            </label>
            <input [(ngModel)]="eventForm.name"
                   name="name"
                   type="text"
                   required
                   placeholder="Ej: Metallica World Tour"
                   class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-violet-500 focus:border-violet-500">
          </div>

          <div>
            <label class="block text-sm font-medium text-white mb-2">
              Descripción *
            </label>
            <textarea [(ngModel)]="eventForm.description"
                      name="description"
                      required
                      rows="3"
                      placeholder="Descripción del evento..."
                      class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-violet-500 focus:border-violet-500"></textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-white mb-2">
                Fecha del Evento *
              </label>
              <input [(ngModel)]="eventForm.eventDate"
                     name="eventDate"
                     type="datetime-local"
                     required
                     class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-violet-500 focus:border-violet-500 [color-scheme:dark]">
            </div>
            <div>
              <label class="block text-sm font-medium text-white mb-2">
                Artista Principal *
              </label>
              <input [(ngModel)]="eventForm.headliner"
                     name="headliner"
                     type="text"
                     required
                     placeholder="Ej: Metallica"
                     class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-violet-500 focus:border-violet-500">
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-white mb-2">
                Precio Mínimo (€) *
              </label>
              <input [(ngModel)]="eventForm.minPrice"
                     name="minPrice"
                     type="number"
                     required
                     min="0"
                     step="0.01"
                     placeholder="50.00"
                     class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-violet-500 focus:border-violet-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-white mb-2">
                Precio Máximo (€) *
              </label>
              <input [(ngModel)]="eventForm.maxPrice"
                     name="maxPrice"
                     type="number"
                     required
                     min="0"
                     step="0.01"
                     placeholder="200.00"
                     class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-violet-500 focus:border-violet-500">
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-white mb-2">
                Capacidad Total *
              </label>
              <input [(ngModel)]="eventForm.totalCapacity"
                     name="totalCapacity"
                     type="number"
                     required
                     min="1"
                     placeholder="5000"
                     class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-violet-500 focus:border-violet-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-white mb-2">
                Venue
              </label>
              <select [(ngModel)]="eventForm.venueId"
                      name="venueId"
                      class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-violet-500 focus:border-violet-500">
                <option value="">Seleccionar venue...</option>
                <option *ngFor="let venue of uniqueVenues" [value]="venue.id">
                  {{ venue.name }} - {{ venue.city }}
                </option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-white mb-2">
                Estado del Evento
              </label>
              <select [(ngModel)]="eventForm.status"
                      name="status"
                      class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-violet-500 focus:border-violet-500">
                <option value="DRAFT">🟡 Borrador (No visible)</option>
                <option value="ACTIVE">🟢 Activo (Visible)</option>
                <option value="CANCELLED">🔴 Cancelado</option>
                <option value="COMPLETED">✅ Completado</option>
              </select>
            </div>
            <div>
              <label class="flex items-center mt-6">
                <input [(ngModel)]="eventForm.isPublished"
                       name="isPublished"
                       type="checkbox"
                       class="rounded border-slate-600 bg-slate-700 text-violet-600 shadow-sm focus:border-violet-300 focus:ring focus:ring-violet-200 focus:ring-opacity-50">
                <span class="ml-2 text-sm text-slate-300">Publicar evento</span>
              </label>
            </div>
          </div>


          <div class="flex justify-end space-x-3 pt-4">
            <button type="button"
                    (click)="closeModal()"
                    class="px-4 py-2 border border-slate-600 rounded-md text-slate-300 hover:bg-slate-700">
              Cancelar
            </button>
            <button type="submit"
                    [disabled]="!isFormValid()"
                    class="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {{ isEditing ? 'Actualizar' : 'Crear' }} Evento
            </button>
          </div>

        </form>
      </div>
    </div>
  `
})
export class EventsListComponent implements OnInit {
  events: Event[] = [];
  filteredEvents: Event[] = [];
  uniqueVenues: any[] = [];
  loading = true;

  searchTerm = '';
  statusFilter = '';
  venueFilter = '';

  showModal = false;
  isEditing = false;
  eventForm = {
    id: '',
    name: '',
    description: '',
    eventDate: '',
    headliner: '',
    minPrice: 0,
    maxPrice: 0,
    totalCapacity: 0,
    venueId: '',
    status: 'DRAFT',
    isPublished: false
  };

  constructor(
    private adminService: AdminService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadEvents();

    this.route.queryParams.subscribe(params => {
      if (params['action'] === 'create') {
        setTimeout(() => {
          this.openCreateModal();
        }, 500);
      }
    });
  }

  loadEvents() {
    this.loading = true;
    this.adminService.getEvents().subscribe({
      next: (response) => {
        this.events = response.data;
        this.filteredEvents = [...this.events];
        this.extractUniqueVenues();
        this.loading = false;

        setTimeout(() => {
          this.cdr.detectChanges();
        }, 100);
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  filterEvents() {
    this.filteredEvents = this.events.filter(event => {
      const matchesSearch = !this.searchTerm ||
        event.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = !this.statusFilter || event.status === this.statusFilter;

      const matchesVenue = !this.venueFilter || event.venue?.id === this.venueFilter;

      return matchesSearch && matchesStatus && matchesVenue;
    });
  }

  extractUniqueVenues() {
    const venueMap = new Map();
    this.events.forEach(event => {
      if (event.venue) {
        venueMap.set(event.venue.id, event.venue);
      }
    });
    this.uniqueVenues = Array.from(venueMap.values());

    if (this.uniqueVenues.length === 0) {
      this.loadVenuesForModal();
    }

    // Venues extraídos de los eventos
  }

  loadVenuesForModal() {
    this.adminService.getVenues().subscribe({
      next: (response) => {
        this.uniqueVenues = response.venues || [];
        // Venues cargados desde la API
      },
      error: (error) => {
        console.error('Error loading venues for modal:', error);
      }
    });
  }

  getEventsByStatus(status: string): Event[] {
    return this.events.filter(event => event.status === status);
  }

  openCreateModal() {
    this.isEditing = false;
    this.eventForm = {
      id: '',
      name: '',
      description: '',
      eventDate: '',
      headliner: '',
      minPrice: 0,
      maxPrice: 0,
      totalCapacity: 0,
      venueId: '',
      status: 'DRAFT',
      isPublished: false
    };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.isEditing = false;
    this.eventForm = {
      id: '',
      name: '',
      description: '',
      eventDate: '',
      headliner: '',
      minPrice: 0,
      maxPrice: 0,
      totalCapacity: 0,
      venueId: '',
      status: 'DRAFT',
      isPublished: false
    };
  }

  saveEvent() {
    if (!this.isFormValid()) return;

    const slug = this.eventForm.name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    const eventDateObj = new Date(this.eventForm.eventDate);
    const saleStartDate = new Date();
    const saleEndDate = new Date(eventDateObj.getTime() - 24 * 60 * 60 * 1000);

    const selectedVenueId = this.eventForm.venueId || this.uniqueVenues[0]?.id;
    if (!selectedVenueId) {
      alert('❌ Error: No hay venues disponibles. Crea un venue primero.');
      return;
    }

    const eventData = {
      name: this.eventForm.name,
      slug,
      description: this.eventForm.description,
      eventDate: eventDateObj.toISOString(),
      saleStartDate: saleStartDate.toISOString(),
      saleEndDate: saleEndDate.toISOString(),
      venueId: selectedVenueId,
      totalCapacity: this.eventForm.totalCapacity,
      genre: 'HEAVY_METAL',
      format: 'CONCERT',
      headliner: this.eventForm.headliner,
      hasMoshpit: true,
      hasVipMeetAndGreet: true,
      merchandiseAvailable: true,
      minPrice: this.eventForm.minPrice,
      maxPrice: this.eventForm.maxPrice,
      ageRestriction: '+16',
      status: this.eventForm.status as 'DRAFT' | 'ACTIVE' | 'CANCELLED' | 'COMPLETED',
      isPublished: this.eventForm.isPublished
    };

    // Preparando datos del evento para enviar

    if (this.isEditing && this.eventForm.id) {
      // Actualizando evento existente

      this.adminService.updateEvent(this.eventForm.id, eventData).subscribe({
        next: (response: any) => {
          // Evento actualizado exitosamente

          if (response.updatedFields && response.ignoredFields) {
            // Mostrar información de campos actualizados
          }

          this.closeModal();
          this.loadEvents();

          let message = 'Evento actualizado exitosamente';
          if (response.ignoredFields && response.ignoredFields.length > 0) {
            message += `\n\nNota: Algunos campos (${response.ignoredFields.join(', ')}) mantienen sus valores originales.`;
          }

          alert(message);
        },
        error: (error) => {
          console.error('❌ Error updating event:', error);
          console.error('📋 Error details:', error.error);

          let errorMessage = 'Error desconocido';
          if (error.error?.error) {
            errorMessage = error.error.error;
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }

          alert('❌ Error al actualizar evento: ' + errorMessage);
        }
      });
    } else {
      this.adminService.createEvent(eventData).subscribe({
        next: (response) => {
          // Evento creado exitosamente
          this.closeModal();
          this.loadEvents();
          alert('Evento creado exitosamente');
        },
        error: (error) => {
          console.error('❌ Error creating event:', error);
          console.error('📋 Error details:', error.error);

          let errorMessage = 'Error desconocido';
          if (error.error?.error) {
            errorMessage = error.error.error;
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }

          alert('❌ Error al crear evento: ' + errorMessage);
        }
      });
    }
  }

  isFormValid(): boolean {
    return !!(this.eventForm.name &&
              this.eventForm.description &&
              this.eventForm.eventDate &&
              this.eventForm.headliner &&
              this.eventForm.minPrice > 0 &&
              this.eventForm.maxPrice > 0 &&
              this.eventForm.totalCapacity > 0);
  }

  editEvent(event: Event) {
    this.isEditing = true;

    // Cargando datos del evento para editar

    this.eventForm = {
      id: event.id,
      name: event.name,
      description: event.description,
      eventDate: new Date(event.eventDate).toISOString().slice(0, 16),
      headliner: event.venue?.name || 'Artista Principal',
      minPrice: (event as any).minPrice || 25,
      maxPrice: (event as any).maxPrice || 50,
      totalCapacity: (event as any).totalCapacity || (event.venue as any)?.capacity || 1000,
      venueId: event.venue?.id || '',
      status: event.status || 'DRAFT',
      isPublished: event.publishedAt ? true : false
    };

    // Formulario cargado con datos del evento
    this.showModal = true;
  }

  viewEvent(event: Event) {
    alert(`Evento: ${event.name}\nDescripción: ${event.description}\nFecha: ${this.formatDate(event.eventDate)}\nEstado: ${this.getStatusText(event.status)}\nVenue: ${event.venue?.name || 'Sin venue'}`);
  }

  toggleEventStatus(event: Event) {
    const newStatus = event.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE';

    this.adminService.updateEvent(event.id, { status: newStatus }).subscribe({
      next: (response) => {
        // Estado del evento cambiado
        this.loadEvents();
        alert(`Evento ${newStatus === 'ACTIVE' ? 'activado' : 'desactivado'} exitosamente`);
      },
      error: (error) => {
        console.error('Error changing status:', error);
        alert('Error al cambiar estado: ' + (error.error?.message || error.message));
      }
    });
  }

  publishEvent(event: Event) {
    this.adminService.updateEvent(event.id, { status: 'ACTIVE' }).subscribe({
      next: () => {
        this.loadEvents();
        alert('Evento publicado exitosamente');
      },
      error: (error) => {
        console.error('Error publishing event:', error);
        alert('Error al publicar evento: ' + (error.error?.message || error.message));
      }
    });
  }

  unpublishEvent(event: Event) {
    this.adminService.updateEvent(event.id, { status: 'DRAFT' }).subscribe({
      next: () => {
        this.loadEvents();
        alert('Evento despublicado exitosamente');
      },
      error: (error) => {
        console.error('Error unpublishing event:', error);
        alert('Error al despublicar evento: ' + (error.error?.message || error.message));
      }
    });
  }

  deleteEvent(event: Event) {
    if (confirm(`¿Estás seguro de que quieres eliminar el evento "${event.name}"?`)) {
      this.adminService.deleteEvent(event.id).subscribe({
        next: () => {
          this.loadEvents();
        },
        error: (error) => {
          console.error('Error deleting event:', error);
        }
      });
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
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
