import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { AdminService, type Event } from '../../../core/services/admin.service';
import Swal from 'sweetalert2';

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
                        <svg class="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
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
                    {{ getEventTotalCapacity(event) }} tipos de localidades
                  </div>
                  <div class="text-sm text-slate-400">
                    Capacidad: {{ getEventTotalSeats(event) }} asientos
                  </div>
                  <div class="text-sm text-green-400">
                    {{ getEventAvailableTickets(event) }} disponibles
                  </div>
                  <div class="text-sm text-slate-300">
                    €{{ getEventMinPrice(event) }}-{{ getEventMaxPrice(event) }}
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
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </button>

                    <button *ngIf="event.status === 'ACTIVE'"
                            (click)="toggleEventStatus(event)"
                            class="text-yellow-600 hover:text-yellow-900 p-1 rounded"
                            title="Poner en borrador (ocultar)">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </button>

                    <button (click)="deleteEvent(event)"
                            class="text-red-600 hover:text-red-900 p-1 rounded">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
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
                <option value="DRAFT">Borrador (No visible)</option>
                <option value="ACTIVE">Activo (Visible)</option>
                <option value="CANCELLED">Cancelado</option>
                <option value="COMPLETED">Completado</option>
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

    <!-- Modal de Localidades -->
    <div *ngIf="showLocalitiesModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        
        <!-- Header del Modal -->
        <div class="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <div>
            <h3 class="text-lg font-medium text-white">Localidades del Evento</h3>
            <p class="text-sm text-slate-300">{{ selectedEvent?.name }}</p>
          </div>
          <button (click)="closeLocalitiesModal()" class="text-slate-400 hover:text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Contenido del Modal -->
        <div class="p-6 overflow-y-auto max-h-[70vh]">
          
          <!-- Loading State -->
          <div *ngIf="loadingLocalities" class="text-center py-8">
            <div class="inline-flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-violet-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Cargando localidades...
            </div>
          </div>

          <!-- Estadísticas Rápidas -->
          <div *ngIf="!loadingLocalities && eventLocalities.length > 0" class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-slate-700/50 rounded-lg p-4">
              <div class="text-sm text-slate-300">Capacidad Total</div>
              <div class="text-2xl font-bold text-white">{{ getTotalCapacity() }}</div>
            </div>
            <div class="bg-slate-700/50 rounded-lg p-4">
              <div class="text-sm text-slate-300">Disponibles</div>
              <div class="text-2xl font-bold text-green-400">{{ getTotalAvailableTickets() }}</div>
            </div>
            <div class="bg-slate-700/50 rounded-lg p-4">
              <div class="text-sm text-slate-300">Vendidas</div>
              <div class="text-2xl font-bold text-red-400">{{ getTotalSoldTickets() }}</div>
            </div>
            <div class="bg-slate-700/50 rounded-lg p-4">
              <div class="text-sm text-slate-300">Reservadas</div>
              <div class="text-2xl font-bold text-yellow-400">{{ getTotalReservedTickets() }}</div>
            </div>
          </div>

          <!-- Lista de Localidades -->
          <div *ngIf="!loadingLocalities && eventLocalities.length > 0" class="space-y-4">
            <div *ngFor="let locality of eventLocalities" class="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center">
                  <div class="w-4 h-4 rounded-full mr-3" [style.background-color]="locality.color"></div>
                  <h4 class="text-lg font-medium text-white">{{ locality.name }}</h4>
                </div>
                <span [class]="getLocalityStatusClass(locality)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                  {{ getLocalityStatusText(locality) }}
                </span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Información de Capacidad -->
                <div>
                  <div class="text-sm text-slate-300 mb-2">Capacidad y Disponibilidad</div>
                  <div class="space-y-2">
                    <div class="flex justify-between text-sm">
                      <span class="text-slate-300">Capacidad Total:</span>
                      <span class="text-white font-medium">{{ locality.capacity }}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                      <span class="text-green-400">Disponibles:</span>
                      <span class="text-green-400 font-medium">{{ locality.availableTickets }}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                      <span class="text-red-400">Vendidas:</span>
                      <span class="text-red-400 font-medium">{{ locality.soldTickets }}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                      <span class="text-yellow-400">Reservadas:</span>
                      <span class="text-yellow-400 font-medium">{{ locality.reservedTickets }}</span>
                    </div>
                  </div>
                </div>

                <!-- Barra de Progreso y Precio -->
                <div>
                  <div class="text-sm text-slate-300 mb-2">Ocupación</div>
                  <div class="space-y-2">
                    <div class="flex justify-between text-sm">
                      <span class="text-slate-300">Ocupación:</span>
                      <span class="text-white font-medium">{{ 100 - getAvailabilityPercentage(locality) }}%</span>
                    </div>
                    <div class="w-full bg-slate-600 rounded-full h-3">
                      <div 
                        class="bg-gradient-to-r from-green-500 to-red-500 h-3 rounded-full transition-all duration-300"
                        [style.width.%]="100 - getAvailabilityPercentage(locality)"
                      ></div>
                    </div>
                    <div class="flex justify-between text-sm mt-3">
                      <span class="text-slate-300">Precio:</span>
                      <span class="text-white font-bold">{{ locality.price | currency:'EUR':'symbol':'1.2-2' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Estado Vacío -->
          <div *ngIf="!loadingLocalities && eventLocalities.length === 0" class="text-center py-8">
            <svg class="mx-auto h-12 w-12 text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
            <h3 class="text-lg font-medium text-white mb-2">Sin localidades configuradas</h3>
            <p class="text-slate-300">Este evento aún no tiene localidades asignadas</p>
          </div>
        </div>

        <!-- Footer del Modal -->
        <div class="px-6 py-4 border-t border-slate-700 flex justify-end">
          <button 
            (click)="closeLocalitiesModal()"
            class="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700"
          >
            Cerrar
          </button>
        </div>
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

  // Modal de localidades
  showLocalitiesModal = false;
  selectedEvent: Event | null = null;
  eventLocalities: any[] = [];
  loadingLocalities = false;

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
      Swal.fire({
        icon: 'error',
        title: 'No hay venues disponibles',
        text: 'Debes crear un venue primero antes de crear un evento.',
        confirmButtonText: 'Entendido'
      });
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

          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: '¡Evento actualizado!',
            text: message,
            showConfirmButton: false,
            timer: 2000,
            toast: true
          });
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

          Swal.fire({
            icon: 'error',
            title: 'Error al actualizar evento',
            text: errorMessage,
            confirmButtonText: 'Entendido'
          });
        }
      });
    } else {
      this.adminService.createEvent(eventData).subscribe({
        next: (response) => {
          // Evento creado exitosamente
          this.closeModal();
          this.loadEvents();
          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: '¡Evento creado!',
            text: 'El evento ha sido creado exitosamente',
            showConfirmButton: false,
            timer: 2000,
            toast: true
          });
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

          Swal.fire({
            icon: 'error',
            title: 'Error al crear evento',
            text: errorMessage,
            confirmButtonText: 'Entendido'
          });
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
    this.selectedEvent = event;
    this.loadEventLocalities(event.id);
    this.showLocalitiesModal = true;
  }

  loadEventLocalities(eventId: string) {
    this.loadingLocalities = true;
    
    // Cargar localidades desde el evento seleccionado
    if (this.selectedEvent && (this.selectedEvent as any).localities) {
      this.eventLocalities = (this.selectedEvent as any).localities || [];
      this.loadingLocalities = false;
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 100);
    } else {
      this.eventLocalities = [];
      this.loadingLocalities = false;
    }
  }

  closeLocalitiesModal() {
    this.showLocalitiesModal = false;
    this.selectedEvent = null;
    this.eventLocalities = [];
  }

  getAvailabilityPercentage(locality: any): number {
    if (locality.capacity === 0) return 0;
    return Math.round((locality.availableTickets / locality.capacity) * 100);
  }

  getLocalityStatusClass(locality: any): string {
    if (!locality.isActive) return 'bg-gray-100 text-gray-800';
    if (locality.availableTickets === 0) return 'bg-red-100 text-red-800';
    if (locality.availableTickets <= locality.capacity * 0.1) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  }

  getLocalityStatusText(locality: any): string {
    if (!locality.isActive) return 'Inactiva';
    if (locality.availableTickets === 0) return 'Agotada';
    if (locality.availableTickets <= locality.capacity * 0.1) return 'Pocas entradas';
    return 'Disponible';
  }

  getTotalCapacity(): number {
    return this.eventLocalities.reduce((sum, locality) => sum + locality.capacity, 0);
  }

  getTotalAvailableTickets(): number {
    return this.eventLocalities.reduce((sum, locality) => sum + locality.availableTickets, 0);
  }

  getTotalSoldTickets(): number {
    return this.eventLocalities.reduce((sum, locality) => sum + locality.soldTickets, 0);
  }

  getTotalReservedTickets(): number {
    return this.eventLocalities.reduce((sum, locality) => sum + locality.reservedTickets, 0);
  }

  // Métodos para calcular desde localidades en la tabla
  getEventTotalCapacity(event: any): number {
    return event.localities?.length || 0;
  }

  getEventTotalSeats(event: any): number {
    if (!event.localities || event.localities.length === 0) return event.totalCapacity || 0;
    return event.localities.reduce((sum: number, loc: any) => sum + (loc.capacity || 0), 0);
  }

  getEventAvailableTickets(event: any): number {
    if (!event.localities || event.localities.length === 0) return event.ticketsAvailable || 0;
    return event.localities.reduce((sum: number, loc: any) => sum + (loc.availableTickets || 0), 0);
  }

  getEventMinPrice(event: any): number {
    if (!event.localities || event.localities.length === 0) return event.ticketPrice || 0;
    return Math.min(...event.localities.map((loc: any) => Number(loc.price) || 0));
  }

  getEventMaxPrice(event: any): number {
    if (!event.localities || event.localities.length === 0) return (event.ticketPrice || 0) * 2;
    return Math.max(...event.localities.map((loc: any) => Number(loc.price) || 0));
  }

  toggleEventStatus(event: Event) {
    const newStatus = event.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE';

    this.adminService.updateEvent(event.id, { status: newStatus }).subscribe({
      next: (response) => {
        // Estado del evento cambiado
        this.loadEvents();
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: `Evento ${newStatus === 'ACTIVE' ? 'activado' : 'desactivado'}`,
          showConfirmButton: false,
          timer: 2000,
          toast: true
        });
      },
      error: (error) => {
        console.error('Error changing status:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error al cambiar estado',
          text: error.error?.message || error.message,
          confirmButtonText: 'Entendido'
        });
      }
    });
  }

  publishEvent(event: Event) {
    this.adminService.updateEvent(event.id, { status: 'ACTIVE' }).subscribe({
      next: () => {
        this.loadEvents();
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: '¡Evento publicado!',
          showConfirmButton: false,
          timer: 2000,
          toast: true
        });
      },
      error: (error) => {
        console.error('Error publishing event:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error al publicar evento',
          text: error.error?.message || error.message,
          confirmButtonText: 'Entendido'
        });
      }
    });
  }

  unpublishEvent(event: Event) {
    this.adminService.updateEvent(event.id, { status: 'DRAFT' }).subscribe({
      next: () => {
        this.loadEvents();
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: '¡Evento despublicado!',
          showConfirmButton: false,
          timer: 2000,
          toast: true
        });
      },
      error: (error) => {
        console.error('Error unpublishing event:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error al despublicar evento',
          text: error.error?.message || error.message,
          confirmButtonText: 'Entendido'
        });
      }
    });
  }

  deleteEvent(event: Event) {
    Swal.fire({
      title: '¿Eliminar evento?',
      text: `¿Estás seguro de que quieres eliminar "${event.name}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.deleteEvent(event.id).subscribe({
          next: () => {
            this.loadEvents();
            Swal.fire({
              position: 'top-end',
              icon: 'success',
              title: '¡Evento eliminado!',
              showConfirmButton: false,
              timer: 2000,
              toast: true
            });
          },
          error: (error) => {
            console.error('Error deleting event:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error al eliminar evento',
              text: error.error?.message || error.message,
              confirmButtonText: 'Entendido'
            });
          }
        });
      }
    });
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
