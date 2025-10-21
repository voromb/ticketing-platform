import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdminService, Venue } from '../../../core/services/admin.service';
import Swal from 'sweetalert2';
import { ImageUploadComponent } from '../../../shared/components/image-upload/image-upload.component';

@Component({
  selector: 'app-venues-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageUploadComponent],
  template: `
    <div class="p-8 pb-16 space-y-8">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 class="text-2xl font-bold text-white">Gestión de Venues</h1>
          <p class="mt-2 text-sm text-slate-300">
            Administra los lugares donde se realizan los eventos
          </p>
        </div>
        <div class="mt-4 sm:mt-0 flex flex-wrap gap-4">
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
          <button
            (click)="openCreateModal()"
            style="border-radius: 24px;"
            class="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                ></path>
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-slate-400">Total</p>
              <p class="text-lg font-semibold text-white">{{ totalVenues }}</p>
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
              <p class="text-lg font-semibold text-green-600">{{ activeVenues }}</p>
            </div>
          </div>
        </div>

        <div
          class="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700/50 p-6"
        >
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg
                class="w-6 h-6 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                ></path>
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-slate-400">Capacidad</p>
              <p class="text-lg font-semibold text-white">{{ totalCapacity.toLocaleString() }}</p>
            </div>
          </div>
        </div>

        <div
          class="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700/50 p-6"
        >
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg
                class="w-6 h-6 text-orange-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                ></path>
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                ></path>
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-slate-400">Ciudades</p>
              <p class="text-lg font-semibold text-white">{{ getUniqueCities().length }}</p>
            </div>
          </div>
        </div>
      </div>

      <div
        class="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700/50 p-8"
      >
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-white mb-2"> Buscar venues </label>
            <input
              [(ngModel)]="searchTerm"
              (input)="filterVenues()"
              type="text"
              placeholder="Nombre o dirección..."
              class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-white placeholder-slate-400 focus:outline-none focus:ring-violet-500 focus:border-violet-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-white mb-2"> Ciudad </label>
            <select
              [(ngModel)]="cityFilter"
              (change)="filterVenues()"
              class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-violet-500 focus:border-violet-500"
            >
              <option value="">Todas las ciudades</option>
              <option *ngFor="let city of getUniqueCities()" [value]="city">
                {{ city }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-white mb-2"> Estado </label>
            <select
              [(ngModel)]="statusFilter"
              (change)="filterVenues()"
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
          <h3 class="text-xl font-semibold text-white">Venues ({{ filteredVenues.length }})</h3>
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
            Cargando venues...
          </div>
        </div>

        <div *ngIf="!loading" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-slate-700/50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider"
                >
                  Venue
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider"
                >
                  Ubicación
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider"
                >
                  Capacidad
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider"
                >
                  Estado
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider"
                >
                  Eventos
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
                *ngFor="let venue of filteredVenues"
                class="hover:bg-slate-700/50 transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div
                        class="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center"
                      >
                        <span class="text-blue-600 font-medium">🏟️</span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-white">
                        {{ venue.name }}
                      </div>
                      <div class="text-sm text-slate-300">ID: {{ venue.id.slice(-8) }}</div>
                    </div>
                  </div>
                </td>

                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-white">{{ venue.city }}</div>
                  <div class="text-sm text-slate-300">{{ venue.address }}</div>
                </td>

                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-white">
                    {{ venue.capacity.toLocaleString() }} personas
                  </div>
                  <div class="text-sm text-slate-300">
                    {{ getCapacityCategory(venue.capacity) }}
                  </div>
                </td>

                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    [class]="getStatusClass(venue.isActive)"
                    class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  >
                    {{ venue.isActive ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>

                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-white">{{ venue.eventCount }} eventos</div>
                  <div class="text-sm text-slate-300">
                    {{ venue.eventStatus }}
                  </div>
                </td>

                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end space-x-2">
                    <button
                      (click)="viewVenue(venue)"
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
                      (click)="editVenue(venue)"
                      class="text-green-600 hover:text-green-900 p-1 rounded"
                      title="Editar venue"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        ></path>
                      </svg>
                    </button>

                    <button
                      *ngIf="venue.isActive"
                      (click)="deactivateVenue(venue)"
                      class="text-yellow-600 hover:text-yellow-900 p-1 rounded"
                      title="Desactivar venue"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636"
                        ></path>
                      </svg>
                    </button>

                    <button
                      *ngIf="!venue.isActive"
                      (click)="activateVenue(venue)"
                      class="text-green-600 hover:text-green-900 p-1 rounded"
                      title="Activar venue"
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

                    <button
                      (click)="deleteVenue(venue)"
                      class="text-red-600 hover:text-red-900 p-1 rounded"
                      title="Eliminar venue"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        ></path>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div *ngIf="filteredVenues.length === 0 && !loading" class="text-center py-12">
            <span class="text-4xl mb-4 block">🏟️</span>
            <h3 class="text-lg font-medium text-white mb-2">No hay venues</h3>
            <p class="text-slate-300 mb-4">
              {{
                searchTerm || cityFilter || statusFilter
                  ? 'No se encontraron venues con los filtros aplicados.'
                  : 'Comienza creando tu primer venue.'
              }}
            </p>
            <button
              *ngIf="!searchTerm && !cityFilter && !statusFilter"
              (click)="openCreateModal()"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700"
            >
              <span class="mr-2">➕</span>
              Crear Primer Venue
            </button>
          </div>
        </div>
      </div>

      <div
        *ngIf="showModal"
        class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
        (click)="closeModal()"
      >
        <div
          class="relative top-10 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-slate-800 border-slate-700"
          (click)="$event.stopPropagation()"
        >
          <div class="mt-3">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-white">
                {{ isEditing ? 'Editar Venue' : 'Crear Nuevo Venue' }}
              </h3>
              <button (click)="closeModal()" class="text-slate-400 hover:text-white">
                <span class="text-2xl">&times;</span>
              </button>
            </div>

            <form (ngSubmit)="saveVenue()" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-white mb-2">
                  Nombre del venue *
                </label>
                <input
                  [(ngModel)]="venueForm.name"
                  name="name"
                  type="text"
                  required
                  placeholder="Ej: Palau de la Música"
                  class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-violet-500 focus:border-violet-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-white mb-2"> Dirección * </label>
                <input
                  [(ngModel)]="venueForm.address"
                  name="address"
                  type="text"
                  required
                  placeholder="Ej: Carrer Palau de la Música, 4-6"
                  class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-violet-500 focus:border-violet-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-white mb-2"> Ciudad * </label>
                <input
                  [(ngModel)]="venueForm.city"
                  name="city"
                  type="text"
                  required
                  placeholder="Ej: Barcelona"
                  class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-violet-500 focus:border-violet-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-white mb-2"> Capacidad * </label>
                <input
                  [(ngModel)]="venueForm.capacity"
                  name="capacity"
                  type="number"
                  required
                  min="1"
                  placeholder="Ej: 2000"
                  class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-violet-500 focus:border-violet-500"
                />
              </div>

              <div>
                <app-image-upload
                  label="Imágenes del Venue"
                  description="Sube fotos del interior y exterior (máx. 15 imágenes)"
                  uploadType="venues"
                  [multiple]="true"
                  [maxFiles]="15"
                  [existingImages]="venueForm.images || []"
                  (imagesUploaded)="onImagesUploaded($event)"
                  (imageRemoved)="onImageRemoved($event)"
                ></app-image-upload>
              </div>

              <div>
                <label class="flex items-center">
                  <input
                    [(ngModel)]="venueForm.isActive"
                    name="isActive"
                    type="checkbox"
                    class="rounded border-slate-600 bg-slate-700 text-violet-600 shadow-sm focus:border-violet-300 focus:ring focus:ring-violet-200 focus:ring-opacity-50"
                  />
                  <span class="ml-2 text-sm text-slate-300">Venue activo</span>
                </label>
              </div>

              <div class="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  (click)="closeModal()"
                  class="px-4 py-2 border border-slate-600 rounded-md text-slate-300 hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  [disabled]="!isFormValid()"
                  class="px-4 py-2 border border-transparent rounded-md text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ isEditing ? 'Actualizar' : 'Crear' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Detalles de Venue -->
    <div
      *ngIf="showVenueModal && selectedVenue"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div
        class="bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden"
      >
        <!-- Header del Modal -->
        <div class="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <div>
            <h3 class="text-lg font-medium text-white">Detalles del Venue</h3>
            <p class="text-sm text-slate-300">{{ selectedVenue.name }}</p>
          </div>
          <button (click)="closeVenueModal()" class="text-slate-400 hover:text-white">
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
          <!-- Información Principal -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div class="bg-slate-700/30 rounded-lg p-4">
              <h4 class="text-sm font-medium text-slate-300 mb-3">Información del Local</h4>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-slate-400">Nombre:</span>
                  <span class="text-white">{{ selectedVenue.name }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">Dirección:</span>
                  <span class="text-white">{{ selectedVenue.address }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">Ciudad:</span>
                  <span class="text-white">{{ selectedVenue.city }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">Capacidad:</span>
                  <span class="text-white font-bold">{{ selectedVenue.capacity }} personas</span>
                </div>
              </div>
            </div>

            <div class="bg-slate-700/30 rounded-lg p-4">
              <h4 class="text-sm font-medium text-slate-300 mb-3">Estado y Actividad</h4>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-slate-400">Estado:</span>
                  <span [class]="selectedVenue.isActive ? 'text-green-400' : 'text-red-400'">
                    {{ selectedVenue.isActive ? 'Activo' : 'Inactivo' }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">ID:</span>
                  <span class="text-white text-xs">{{ selectedVenue.id }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Estadísticas del Venue -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-slate-700/30 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-blue-400">{{ getVenueEventsCount() }}</div>
              <div class="text-sm text-slate-300">Eventos Programados</div>
            </div>
            <div class="bg-slate-700/30 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-green-400">{{ getVenueOccupancyRate() }}%</div>
              <div class="text-sm text-slate-300">Tasa de Ocupación</div>
            </div>
            <div class="bg-slate-700/30 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-yellow-400">€{{ getVenueRevenue() }}</div>
              <div class="text-sm text-slate-300">Ingresos Estimados</div>
            </div>
          </div>
        </div>

        <!-- Footer del Modal -->
        <div class="px-6 py-4 border-t border-slate-700 flex justify-end">
          <button
            (click)="closeVenueModal()"
            class="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  `,
})
export class VenuesListComponent implements OnInit {
  venues: Venue[] = [];
  filteredVenues: Venue[] = [];
  loading = true;

  totalVenues = 0;
  activeVenues = 0;
  inactiveVenues = 0;
  totalCapacity = 0;

  searchTerm = '';
  cityFilter = '';
  statusFilter = '';

  showModal = false;
  isEditing = false;
  venueForm: Partial<Venue> = {
    name: '',
    address: '',
    city: '',
    capacity: 0,
    isActive: true,
    images: [],
  };

  // Modal de detalles de venue
  showVenueModal = false;
  selectedVenue: Venue | null = null;

  constructor(
    private adminService: AdminService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadVenues();

    this.route.queryParams.subscribe((params) => {
      if (params['action'] === 'create') {
        setTimeout(() => {
          this.openCreateModal();
        }, 500);
      }
    });
  }

  loadVenues() {
    this.loading = true;
    this.adminService.getVenues().subscribe({
      next: (response) => {
        this.venues = response.venues.map((venue) => ({
          ...venue,
          eventCount: venue._count?.events || 0,
          eventStatus: (venue._count?.events || 0) > 0 ? 'Con actividad' : 'Sin eventos',
        }));
        this.filteredVenues = [...this.venues];

        this.totalVenues = this.venues.length;
        this.activeVenues = this.venues.filter((v) => v.isActive).length;
        this.inactiveVenues = this.venues.filter((v) => !v.isActive).length;
        this.totalCapacity = this.venues.reduce((sum, v) => sum + (v.capacity || 0), 0);

        this.loading = false;

        setTimeout(() => {
          this.cdr.detectChanges();
        }, 100);
      },
      error: (error) => {
        console.error('❌ Error loading venues:', error);
        this.loading = false;
      },
    });
  }

  filterVenues() {
    this.filteredVenues = this.venues.filter((venue) => {
      const matchesSearch =
        !this.searchTerm ||
        venue.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        venue.address.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesCity = !this.cityFilter || venue.city === this.cityFilter;

      const matchesStatus = !this.statusFilter || venue.isActive.toString() === this.statusFilter;

      return matchesSearch && matchesCity && matchesStatus;
    });
  }

  refreshData() {
    this.loadVenues();
  }

  getActiveVenues(): Venue[] {
    return this.venues.filter((venue) => venue.isActive);
  }

  getTotalCapacity(): number {
    return this.venues.reduce((total, venue) => total + venue.capacity, 0);
  }

  getUniqueCities(): string[] {
    const cities = [...new Set(this.venues.map((venue) => venue.city))];
    return cities.sort();
  }

  getCapacityCategory(capacity: number): string {
    if (capacity < 500) return 'Pequeño';
    if (capacity < 2000) return 'Mediano';
    if (capacity < 10000) return 'Grande';
    return 'Estadio';
  }

  openCreateModal() {
    this.isEditing = false;
    this.venueForm = {
      name: '',
      address: '',
      city: '',
      capacity: 0,
      isActive: true,
      images: [],
    };
    this.showModal = true;
  }

  editVenue(venue: Venue) {
    this.isEditing = true;
    this.venueForm = { ...venue };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.isEditing = false;
    this.venueForm = {
      name: '',
      address: '',
      city: '',
      capacity: 0,
      isActive: true,
      images: [],
    };
  }

  saveVenue() {
    if (!this.isFormValid()) return;

    if (this.isEditing && this.venueForm.id) {
      const venueUpdateData = {
        name: this.venueForm.name,
        address: this.venueForm.address,
        city: this.venueForm.city,
        capacity: Number(this.venueForm.capacity),
        slug: (this.venueForm.name || '')
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '')
          .trim(),
        country: this.venueForm.country || 'España',
        postalCode: this.venueForm.postalCode || '46001',
        amenities: this.venueForm.amenities || ['parking', 'bar'],
        images: this.venueForm.images || [],
        isActive: this.venueForm.isActive,
      };

      this.adminService.updateVenue(this.venueForm.id, venueUpdateData).subscribe({
        next: () => {
          this.closeModal();
          this.loadVenues();
          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: '¡Venue actualizado exitosamente!',
            text: `${venueUpdateData.name} ha sido actualizado correctamente`,
            showConfirmButton: false,
            timer: 2500,
            toast: true,
          });
        },
        error: (error) => {
          console.error('❌ Error updating venue:', error);
          console.error('📋 Error details:', error.error);

          let errorMessage = 'Error desconocido al actualizar el venue';
          if (error.error?.error) {
            errorMessage = error.error.error;
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }

          Swal.fire({
            icon: 'error',
            title: 'Error al actualizar venue',
            text: errorMessage,
            confirmButtonText: 'Entendido',
          });
        },
      });
    } else {
      const venueData = {
        name: this.venueForm.name,
        address: this.venueForm.address,
        city: this.venueForm.city,
        capacity: Number(this.venueForm.capacity),
        slug: (this.venueForm.name || '')
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '')
          .trim(),
        country: 'España',
        postalCode: '46001',
        amenities: ['parking', 'bar'],
        images: this.venueForm.images || [],
        isActive: true,
      };

      this.adminService.createVenue(venueData).subscribe({
        next: (response) => {
          this.closeModal();
          this.loadVenues();
          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: '¡Venue creado exitosamente!',
            text: `${venueData.name} ha sido creado correctamente`,
            showConfirmButton: false,
            timer: 2500,
            toast: true,
          });
        },
        error: (error) => {
          console.error('❌ Error creating venue:', error);
          console.error('📋 Error details:', error.error);
          console.error('📋 Status:', error.status);
          console.error('📋 Message:', error.message);

          let errorMessage = 'Error desconocido al crear el venue';
          let errorTitle = 'Error al crear venue';
          
          if (error.error?.error) {
            errorMessage = error.error.error;
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          // Si el error es de red o servidor
          if (error.status === 0) {
            errorTitle = 'Error de conexión';
            errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
          } else if (error.status >= 500) {
            errorTitle = 'Error del servidor';
            errorMessage = 'Hubo un problema en el servidor. Intenta de nuevo más tarde.';
          }

          Swal.fire({
            icon: 'error',
            title: errorTitle,
            text: errorMessage,
            confirmButtonText: 'Entendido',
          });
        },
      });
    }
  }

  isFormValid(): boolean {
    return !!(
      this.venueForm.name &&
      this.venueForm.address &&
      this.venueForm.city &&
      this.venueForm.capacity &&
      this.venueForm.capacity > 0
    );
  }

  viewVenue(venue: Venue) {
    this.selectedVenue = venue;
    this.showVenueModal = true;
  }

  closeVenueModal() {
    this.showVenueModal = false;
    this.selectedVenue = null;
  }

  getVenueEventsCount(): number {
    return this.selectedVenue?._count?.events || 0;
  }

  getVenueOccupancyRate(): number {
    return 0;
  }

  getVenueRevenue(): number {
    return 0;
  }

  activateVenue(venue: Venue) {
    this.adminService.updateVenue(venue.id, { isActive: true }).subscribe({
      next: () => {
        this.loadVenues();
      },
      error: (error) => {
        console.error('Error activating venue:', error);
      },
    });
  }

  deactivateVenue(venue: Venue) {
    if (confirm(`¿Estás seguro de que quieres desactivar el venue "${venue.name}"?`)) {
      this.adminService.updateVenue(venue.id, { isActive: false }).subscribe({
        next: () => {
          this.loadVenues();
        },
        error: (error) => {
          console.error('Error deactivating venue:', error);
        },
      });
    }
  }

  deleteVenue(venue: Venue) {
    if (
      confirm(
        `¿Estás seguro de que quieres eliminar el venue "${venue.name}"? Esta acción no se puede deshacer.`
      )
    ) {
      this.adminService.deleteVenue(venue.id).subscribe({
        next: () => {
          this.loadVenues();
        },
        error: (error) => {
          console.error('Error deleting venue:', error);
        },
      });
    }
  }

  getStatusClass(isActive: boolean): string {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  }

  onImagesUploaded(imageUrls: string[]) {
    if (!this.venueForm.images) {
      this.venueForm.images = [];
    }
    this.venueForm.images = [...this.venueForm.images, ...imageUrls];
  }

  onImageRemoved(imageUrl: string) {
    if (this.venueForm.images) {
      this.venueForm.images = this.venueForm.images.filter((url) => url !== imageUrl);
    }
  }
}
