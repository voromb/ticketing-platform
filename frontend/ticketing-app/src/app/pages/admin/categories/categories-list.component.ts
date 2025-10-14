import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { AdminService, type Category, type Subcategory, type CategoryStats } from '../../../core/services/admin.service';
import Swal from 'sweetalert2';
import { ImageUploadComponent } from '../../../shared/components/image-upload/image-upload.component';

@Component({
  selector: 'app-categories-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ImageUploadComponent],
  template: `
    <div class="p-8 pb-16 space-y-8">
      <!-- Header con estadísticas -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 class="text-2xl font-bold text-white">Gestión de Categorías</h1>
          <p class="mt-2 text-sm text-slate-300">
            Administra categorías y subcategorías de eventos
          </p>
        </div>
        <div class="mt-4 sm:mt-0 flex flex-wrap gap-4">
          <button
            (click)="openCreateCategoryModal()"
            style="border-radius: 24px;"
            class="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium text-white bg-gray-700 hover:bg-gray-800 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              ></path>
            </svg>
            Nueva Categoría
          </button>
          <button
            (click)="openCreateSubcategoryModal()"
            style="border-radius: 24px;"
            class="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              ></path>
            </svg>
            Nueva Subcategoría
          </button>
        </div>
      </div>

      <!-- Estadísticas -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          class="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700/50 p-6"
        >
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg
                class="w-8 h-8 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                ></path>
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-slate-300 truncate">Total Categorías</dt>
                <dd class="text-2xl font-bold text-white">{{ totalCategories }}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div
          class="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700/50 p-6"
        >
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg
                class="w-8 h-8 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                ></path>
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-slate-300 truncate">Subcategorías</dt>
                <dd class="text-2xl font-bold text-white">{{ totalSubcategories }}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div
          class="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700/50 p-6"
        >
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg
                class="w-8 h-8 text-yellow-400"
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
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-slate-300 truncate">Con Eventos</dt>
                <dd class="text-2xl font-bold text-white">{{ categoriesWithEvents }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading state -->
      <div *ngIf="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        <p class="text-slate-300 mt-4">Cargando categorías...</p>
      </div>

      <!-- Tabs y contenido -->
      <div
        *ngIf="!loading"
        class="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700/50"
      >
        <!-- Tabs -->
        <div class="border-b border-slate-700">
          <nav class="-mb-px flex space-x-8 px-8 pt-6">
            <button
              (click)="switchTab('categories')"
              [class]="
                activeTab === 'categories'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300'
              "
              class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200"
            >
              Categorías ({{ totalCategories }})
            </button>
            <button
              (click)="switchTab('subcategories')"
              [class]="
                activeTab === 'subcategories'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300'
              "
              class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200"
            >
              Subcategorías ({{ totalSubcategories }})
            </button>
          </nav>
        </div>

        <!-- Filtros -->
        <div class="p-8 border-b border-slate-700">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-white mb-2"> Buscar </label>
              <input
                [(ngModel)]="searchTerm"
                (input)="onSearch()"
                type="text"
                [placeholder]="
                  activeTab === 'categories'
                    ? 'Nombre de categoría...'
                    : 'Nombre de subcategoría...'
                "
                class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-white placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-white mb-2"> Ordenar por </label>
              <select
                [(ngModel)]="sortBy"
                (change)="onSort(sortBy)"
                class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="name">Nombre</option>
                <option value="events">Eventos</option>
                <option *ngIf="activeTab === 'categories'" value="subcategories">
                  Subcategorías
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-white mb-2"> Orden </label>
              <select
                [(ngModel)]="sortOrder"
                (change)="activeTab === 'categories' ? applyFilters() : applySubcategoryFilters()"
                class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="asc">Ascendente</option>
                <option value="desc">Descendente</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Tabla de Categorías -->
        <div *ngIf="activeTab === 'categories'" class="p-8">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-700">
              <thead>
                <tr>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider"
                  >
                    Categoría
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider"
                  >
                    Subcategorías
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
              <tbody class="divide-y divide-slate-700">
                <tr
                  *ngFor="let category of filteredCategories"
                  class="hover:bg-slate-700/50 transition-colors duration-200"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-8 w-8">
                        <div
                          class="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center"
                        >
                          <span class="text-sm font-medium text-white">{{
                            category.name.charAt(0).toUpperCase()
                          }}</span>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-white">{{ category.name }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-600 text-slate-200"
                    >
                      {{ category._count?.subcategories || 0 }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-600 text-green-100"
                    >
                      {{ category._count?.events || 0 }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex justify-end space-x-2">
                      <button
                        (click)="viewCategoryDetails(category)"
                        class="text-violet-600 hover:text-violet-900 transition-colors duration-200"
                        title="Ver detalles"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        (click)="openEditCategoryModal(category)"
                        class="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                        title="Editar"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          ></path>
                        </svg>
                      </button>
                      <button
                        (click)="openDeleteModal('category', category)"
                        class="text-red-400 hover:text-red-300 transition-colors duration-200"
                        title="Eliminar"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

            <div *ngIf="filteredCategories.length === 0" class="text-center py-12">
              <svg
                class="mx-auto h-12 w-12 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                ></path>
              </svg>
              <h3 class="mt-2 text-sm font-medium text-slate-300">No hay categorías</h3>
              <p class="mt-1 text-sm text-slate-400">Comienza creando una nueva categoría.</p>
            </div>
          </div>
        </div>

        <!-- Tabla de Subcategorías -->
        <div *ngIf="activeTab === 'subcategories'" class="p-8">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-700">
              <thead>
                <tr>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider"
                  >
                    Subcategoría
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider"
                  >
                    Categoría Padre
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
              <tbody class="divide-y divide-slate-700">
                <tr
                  *ngFor="let subcategory of filteredSubcategories"
                  class="hover:bg-slate-700/50 transition-colors duration-200"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-8 w-8">
                        <div
                          class="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center"
                        >
                          <span class="text-sm font-medium text-white">{{
                            subcategory.name.charAt(0).toUpperCase()
                          }}</span>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-white">{{ subcategory.name }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-600 text-blue-100"
                    >
                      {{ subcategory.category?.name }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-600 text-green-100"
                    >
                      {{ subcategory._count?.events || 0 }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex justify-end space-x-2">
                      <button
                        (click)="viewSubcategoryDetails(subcategory)"
                        class="text-violet-600 hover:text-violet-900 transition-colors duration-200"
                        title="Ver detalles"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        (click)="openEditSubcategoryModal(subcategory)"
                        class="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                        title="Editar"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          ></path>
                        </svg>
                      </button>
                      <button
                        (click)="openDeleteModal('subcategory', subcategory)"
                        class="text-red-400 hover:text-red-300 transition-colors duration-200"
                        title="Eliminar"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

            <div *ngIf="filteredSubcategories.length === 0" class="text-center py-12">
              <svg
                class="mx-auto h-12 w-12 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                ></path>
              </svg>
              <h3 class="mt-2 text-sm font-medium text-slate-300">No hay subcategorías</h3>
              <p class="mt-1 text-sm text-slate-400">Comienza creando una nueva subcategoría.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Modales -->
      <!-- Modal Crear Categoría -->
      <div
        *ngIf="showCreateCategoryModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-slate-800 rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
          <h3 class="text-lg font-medium text-white mb-4">Nueva Categoría</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-white mb-2">Nombre *</label>
              <input
                [(ngModel)]="categoryForm.name"
                type="text"
                placeholder="Nombre de la categoría"
                class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <!-- Descripción -->
            <div>
              <label class="block text-sm font-medium text-white mb-2">Descripción</label>
              <textarea
                [(ngModel)]="categoryForm.description"
                name="description"
                rows="2"
                placeholder="Descripción de la categoría"
                class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>

            <!-- Icono -->
            <div>
              <app-image-upload
                label="Icono de Categoría"
                description="Icono pequeño para menús (1 archivo, máx. 1MB)"
                uploadType="categories"
                [multiple]="false"
                [maxFiles]="1"
                [maxSizeMB]="1"
                [existingImages]="categoryForm.icon ? [categoryForm.icon] : []"
                (imagesUploaded)="onCategoryIconUploaded($event)"
              ></app-image-upload>
            </div>

            <!-- Imagen Principal -->
            <div>
              <app-image-upload
                label="Imagen Principal"
                description="Imagen de portada de la categoría"
                uploadType="categories"
                [multiple]="false"
                [maxFiles]="1"
                [existingImages]="categoryForm.image ? [categoryForm.image] : []"
                (imagesUploaded)="onCategoryImageUploaded($event)"
              ></app-image-upload>
            </div>
          </div>
          <div class="flex justify-end space-x-3 mt-6">
            <button
              (click)="closeModals()"
              class="px-4 py-2 text-slate-300 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              (click)="createCategory()"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Crear
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Editar Categoría -->
      <div
        *ngIf="showEditCategoryModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-slate-800 rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
          <h3 class="text-lg font-medium text-white mb-4">Editar Categoría</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-white mb-2">Nombre *</label>
              <input
                [(ngModel)]="categoryForm.name"
                type="text"
                placeholder="Nombre de la categoría"
                class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <!-- Descripción -->
            <div>
              <label class="block text-sm font-medium text-white mb-2">Descripción</label>
              <textarea
                [(ngModel)]="categoryForm.description"
                name="description"
                rows="2"
                placeholder="Descripción de la categoría"
                class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>

            <!-- Icono -->
            <div>
              <app-image-upload
                label="Icono de Categoría"
                description="Icono pequeño para menús (1 archivo, máx. 1MB)"
                uploadType="categories"
                [multiple]="false"
                [maxFiles]="1"
                [maxSizeMB]="1"
                [existingImages]="categoryForm.icon ? [categoryForm.icon] : []"
                (imagesUploaded)="onCategoryIconUploaded($event)"
              ></app-image-upload>
            </div>

            <!-- Imagen Principal -->
            <div>
              <app-image-upload
                label="Imagen Principal"
                description="Imagen de portada de la categoría"
                uploadType="categories"
                [multiple]="false"
                [maxFiles]="1"
                [existingImages]="categoryForm.image ? [categoryForm.image] : []"
                (imagesUploaded)="onCategoryImageUploaded($event)"
              ></app-image-upload>
            </div>
          </div>
          <div class="flex justify-end space-x-3 mt-6">
            <button
              (click)="closeModals()"
              class="px-4 py-2 text-slate-300 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              (click)="updateCategory()"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Actualizar
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Crear Subcategoría -->
      <div
        *ngIf="showCreateSubcategoryModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-slate-800 rounded-xl p-6 w-full max-w-md mx-4">
          <h3 class="text-lg font-medium text-white mb-4">Nueva Subcategoría</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-white mb-2">Categoría Padre</label>
              <select
                [(ngModel)]="subcategoryForm.categoryId"
                class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option [value]="0">Seleccionar categoría</option>
                <option *ngFor="let category of categories" [value]="category.id">
                  {{ category.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-white mb-2">Nombre</label>
              <input
                [(ngModel)]="subcategoryForm.name"
                type="text"
                placeholder="Nombre de la subcategoría"
                class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div class="flex justify-end space-x-3 mt-6">
            <button
              (click)="closeModals()"
              class="px-4 py-2 text-slate-300 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              (click)="createSubcategory()"
              class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
            >
              Crear
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Editar Subcategoría -->
      <div
        *ngIf="showEditSubcategoryModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-slate-800 rounded-xl p-6 w-full max-w-md mx-4">
          <h3 class="text-lg font-medium text-white mb-4">Editar Subcategoría</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-white mb-2">Categoría Padre</label>
              <select
                [(ngModel)]="subcategoryForm.categoryId"
                class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option *ngFor="let category of categories" [value]="category.id">
                  {{ category.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-white mb-2">Nombre</label>
              <input
                [(ngModel)]="subcategoryForm.name"
                type="text"
                placeholder="Nombre de la subcategoría"
                class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div class="flex justify-end space-x-3 mt-6">
            <button
              (click)="closeModals()"
              class="px-4 py-2 text-slate-300 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              (click)="updateSubcategory()"
              class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
            >
              Actualizar
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Eliminar -->
      <div
        *ngIf="showDeleteModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-slate-800 rounded-xl p-6 w-full max-w-md mx-4">
          <h3 class="text-lg font-medium text-white mb-4">Confirmar Eliminación</h3>
          <p class="text-slate-300 mb-6">
            ¿Estás seguro de que quieres eliminar esta
            {{ deleteTarget?.type === 'category' ? 'categoría' : 'subcategoría' }}?
          </p>
          <div class="flex justify-end space-x-3">
            <button
              (click)="closeModals()"
              class="px-4 py-2 text-slate-300 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              (click)="confirmDelete()"
              class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Detalles de Categoría -->
    <div
      *ngIf="showCategoryDetailsModal && selectedCategory"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div
        class="bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden"
      >
        <div class="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <div>
            <h3 class="text-lg font-medium text-white">Detalles de la Categoría</h3>
            <p class="text-sm text-slate-300">{{ selectedCategory.name }}</p>
          </div>
          <button (click)="closeCategoryDetailsModal()" class="text-slate-400 hover:text-white">
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

        <div class="p-6 overflow-y-auto max-h-[70vh]">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div class="bg-slate-700/30 rounded-lg p-4">
              <h4 class="text-sm font-medium text-slate-300 mb-3">Información de la Categoría</h4>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-slate-400">Nombre:</span>
                  <span class="text-white">{{ selectedCategory.name }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">ID:</span>
                  <span class="text-white text-xs">{{ selectedCategory.id }}</span>
                </div>
              </div>
            </div>

            <div class="bg-slate-700/30 rounded-lg p-4">
              <h4 class="text-sm font-medium text-slate-300 mb-3">Estadísticas</h4>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-slate-400">Subcategorías:</span>
                  <span class="text-white font-bold">{{
                    selectedCategory._count?.subcategories || 0
                  }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">Eventos:</span>
                  <span class="text-white font-bold">{{
                    selectedCategory._count?.events || 0
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-slate-700 flex justify-end">
          <button
            (click)="closeCategoryDetailsModal()"
            class="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Detalles de Subcategoría -->
    <div
      *ngIf="showSubcategoryDetailsModal && selectedSubcategory"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div
        class="bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden"
      >
        <div class="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <div>
            <h3 class="text-lg font-medium text-white">Detalles de la Subcategoría</h3>
            <p class="text-sm text-slate-300">{{ selectedSubcategory.name }}</p>
          </div>
          <button (click)="closeSubcategoryDetailsModal()" class="text-slate-400 hover:text-white">
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

        <div class="p-6 overflow-y-auto max-h-[70vh]">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div class="bg-slate-700/30 rounded-lg p-4">
              <h4 class="text-sm font-medium text-slate-300 mb-3">
                Información de la Subcategoría
              </h4>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-slate-400">Nombre:</span>
                  <span class="text-white">{{ selectedSubcategory.name }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">Categoría Padre:</span>
                  <span class="text-white">{{
                    selectedSubcategory.category?.name || 'Sin categoría'
                  }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">ID:</span>
                  <span class="text-white text-xs">{{ selectedSubcategory.id }}</span>
                </div>
              </div>
            </div>

            <div class="bg-slate-700/30 rounded-lg p-4">
              <h4 class="text-sm font-medium text-slate-300 mb-3">Estadísticas</h4>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-slate-400">Eventos:</span>
                  <span class="text-white font-bold">{{
                    selectedSubcategory._count?.events || 0
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-slate-700 flex justify-end">
          <button
            (click)="closeSubcategoryDetailsModal()"
            class="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class CategoriesListComponent implements OnInit {
  categories: Category[] = [];
  subcategories: Subcategory[] = [];
  filteredCategories: Category[] = [];
  filteredSubcategories: Subcategory[] = [];
  loading = false;
  activeTab: 'categories' | 'subcategories' = 'categories';
  totalCategories = 0;
  totalSubcategories = 0;
  categoriesWithEvents = 0;
  searchTerm = '';
  sortBy: 'name' | 'events' | 'subcategories' = 'name';
  sortOrder: 'asc' | 'desc' = 'asc';
  showCreateCategoryModal = false;
  showEditCategoryModal = false;
  showCreateSubcategoryModal = false;
  showEditSubcategoryModal = false;
  showDeleteModal = false;
  showCategoryDetailsModal = false;
  showSubcategoryDetailsModal = false;

  categoryForm = {
    id: 0,
    name: '',
    description: '',
    icon: '',
    image: '',
    images: [] as string[],
  };

  subcategoryForm = {
    id: 0,
    categoryId: 0,
    name: '',
  };

  selectedCategory: Category | null = null;
  selectedSubcategory: Subcategory | null = null;
  deleteTarget: { type: 'category' | 'subcategory'; item: any } | null = null;

  constructor(
    private adminService: AdminService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.loadCategories();
    this.loadSubcategories();
    this.loadStats();
  }

  loadCategories() {
    this.adminService.getCategories({ includeSubcategories: true }).subscribe({
      next: (response) => {
        this.categories = response.data;
        this.filteredCategories = [...this.categories];
        this.applyFilters();

        setTimeout(() => {
          this.cdr.detectChanges();
        }, 100);
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
        this.cdr.detectChanges();
      },
    });
  }

  loadSubcategories() {
    this.adminService.getSubcategories().subscribe({
      next: (response) => {
        this.subcategories = response.data || [];
        this.filteredSubcategories = [...this.subcategories];
        this.applySubcategoryFilters();

        setTimeout(() => {
          this.cdr.detectChanges();
        }, 100);
      },
      error: (error) => {
        console.error('Error al cargar subcategorías:', error);
        this.subcategories = [];
        this.filteredSubcategories = [];
        this.cdr.detectChanges();
      },
    });
  }

  loadStats() {
    this.adminService.getCategoryStats().subscribe({
      next: (response) => {
        const stats = response.data;
        this.totalCategories = stats.totalCategories;
        this.totalSubcategories = stats.totalSubcategories;
        this.categoriesWithEvents = stats.categoriesWithEvents;
        this.loading = false;

        setTimeout(() => {
          this.cdr.detectChanges();
        }, 100);
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  applyFilters() {
    let filtered = [...this.categories];

    if (this.searchTerm) {
      filtered = filtered.filter((category) =>
        category.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (this.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'events':
          aValue = a._count?.events || 0;
          bValue = b._count?.events || 0;
          break;
        case 'subcategories':
          aValue = a._count?.subcategories || 0;
          bValue = b._count?.subcategories || 0;
          break;
        default:
          return 0;
      }

      if (this.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    this.filteredCategories = filtered;
  }

  applySubcategoryFilters() {
    let filtered = [...this.subcategories];

    if (this.searchTerm) {
      filtered = filtered.filter(
        (subcategory) =>
          subcategory.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          subcategory.category?.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (this.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'events':
          aValue = a._count?.events || 0;
          bValue = b._count?.events || 0;
          break;
        default:
          return 0;
      }

      if (this.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    this.filteredSubcategories = filtered;
  }

  onSearch() {
    if (this.activeTab === 'categories') {
      this.applyFilters();
    } else {
      this.applySubcategoryFilters();
    }
  }

  onSort(field: 'name' | 'events' | 'subcategories') {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = 'asc';
    }

    if (this.activeTab === 'categories') {
      this.applyFilters();
    } else {
      this.applySubcategoryFilters();
    }
  }

  switchTab(tab: 'categories' | 'subcategories') {
    this.activeTab = tab;
    this.searchTerm = '';
    this.sortBy = 'name';
    this.sortOrder = 'asc';

    if (tab === 'categories') {
      this.applyFilters();
    } else {
      this.loadSubcategories();
      this.applySubcategoryFilters();
    }
  }

  openCreateCategoryModal() {
    this.categoryForm = {
      id: 0,
      name: '',
      description: '',
      icon: '',
      image: '',
      images: [],
    };
    this.showCreateCategoryModal = true;
  }

  openEditCategoryModal(category: Category) {
    console.log('📝 Abriendo modal de edición para categoría:', category);

    this.selectedCategory = category;
    this.categoryForm = {
      id: category.id,
      name: category.name,
      description: (category as any).description || '',
      icon: (category as any).icon || '',
      image: (category as any).image || '',
      images: (category as any).images || [],
    };

    console.log('📝 selectedCategory:', this.selectedCategory);
    console.log('📝 categoryForm:', this.categoryForm);

    this.showEditCategoryModal = true;
  }

  openCreateSubcategoryModal() {
    this.subcategoryForm = { id: 0, categoryId: 0, name: '' };
    this.showCreateSubcategoryModal = true;
  }

  openEditSubcategoryModal(subcategory: Subcategory) {
    this.subcategoryForm = {
      id: subcategory.id,
      categoryId: subcategory.categoryId,
      name: subcategory.name,
    };
    this.selectedSubcategory = subcategory;
    this.showEditSubcategoryModal = true;
  }

  openDeleteModal(type: 'category' | 'subcategory', item: Category | Subcategory) {
    this.deleteTarget = { type, item };
    this.showDeleteModal = true;
  }

  closeModals() {
    this.showCreateCategoryModal = false;
    this.showEditCategoryModal = false;
    this.showCreateSubcategoryModal = false;
    this.showEditSubcategoryModal = false;
    this.showDeleteModal = false;
    this.showCategoryDetailsModal = false;
    this.showSubcategoryDetailsModal = false;
    this.selectedCategory = null;
    this.selectedSubcategory = null;
    this.deleteTarget = null;
  }

  createCategory() {
    if (!this.categoryForm.name.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'El nombre de la categoría es obligatorio',
        confirmButtonColor: '#3b82f6',
      });
      return;
    }

    this.adminService
      .createCategory({
        name: this.categoryForm.name,
        description: this.categoryForm.description,
        icon: this.categoryForm.icon,
        image: this.categoryForm.image,
        images: this.categoryForm.images,
      })
      .subscribe({
        next: (response) => {
          this.showCreateCategoryModal = false;
          this.categoryForm = {
            id: 0,
            name: '',
            description: '',
            icon: '',
            image: '',
            images: [],
          };

          Swal.fire({
            icon: 'success',
            title: '¡Categoría creada!',
            text: `La categoría "${response.data.name}" se ha creado exitosamente`,
            timer: 2000,
            showConfirmButton: false,
          });

          this.loadData();
          setTimeout(() => this.cdr.detectChanges(), 100);
        },
        error: (error) => {
          console.error('Error al crear categoría:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error al crear',
            text: error.error?.error || 'No se pudo crear la categoría',
            confirmButtonColor: '#3b82f6',
          });
        },
      });
  }

  updateCategory() {
    console.log('🔄 updateCategory() llamado');

    if (!this.categoryForm.name.trim() || !this.selectedCategory) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'El nombre de la categoría es obligatorio',
        confirmButtonColor: '#3b82f6',
      });
      return;
    }

    console.log('✅ Validación OK, enviando PUT...');

    this.adminService
      .updateCategory(this.selectedCategory.id, {
        name: this.categoryForm.name,
        description: this.categoryForm.description,
        icon: this.categoryForm.icon,
        image: this.categoryForm.image,
        images: this.categoryForm.images,
      })
      .subscribe({
        next: (response) => {
          console.log('✅ Actualización exitosa:', response);
          this.closeModals();

          Swal.fire({
            icon: 'success',
            title: '¡Categoría actualizada!',
            text: `Los cambios en "${response.data.name}" se guardaron correctamente`,
            timer: 2000,
            showConfirmButton: false,
          });

          this.loadData();
        },
        error: (error) => {
          console.error('❌ Error al actualizar categoría:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error al actualizar',
            text: error.error?.error || 'No se pudo actualizar la categoría',
            confirmButtonColor: '#3b82f6',
          });
        },
      });
  }

  createSubcategory() {
    if (!this.subcategoryForm.name.trim() || !this.subcategoryForm.categoryId) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Debes seleccionar una categoría y escribir un nombre',
        confirmButtonColor: '#3b82f6',
      });
      return;
    }

    const subcategoryData = {
      categoryId: Number(this.subcategoryForm.categoryId),
      name: this.subcategoryForm.name.trim(),
    };

    this.adminService.createSubcategory(subcategoryData).subscribe({
      next: (response) => {
        this.showCreateSubcategoryModal = false;
        this.subcategoryForm = { id: 0, categoryId: 0, name: '' };

        Swal.fire({
          icon: 'success',
          title: '¡Subcategoría creada!',
          text: `La subcategoría "${response.data.name}" se ha creado exitosamente`,
          timer: 2000,
          showConfirmButton: false,
        });

        this.loadData();
        setTimeout(() => this.cdr.detectChanges(), 100);
      },
      error: (error) => {
        console.error('Error al crear subcategoría:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error al crear',
          text: error.error?.error || 'No se pudo crear la subcategoría',
          confirmButtonColor: '#3b82f6',
        });
      },
    });
  }

  updateSubcategory() {
    if (!this.subcategoryForm.name.trim() || !this.selectedSubcategory) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'El nombre de la subcategoría es obligatorio',
        confirmButtonColor: '#3b82f6',
      });
      return;
    }

    this.adminService
      .updateSubcategory(this.selectedSubcategory.id, {
        categoryId: this.subcategoryForm.categoryId,
        name: this.subcategoryForm.name,
      })
      .subscribe({
        next: (response) => {
          this.closeModals();

          Swal.fire({
            icon: 'success',
            title: '¡Subcategoría actualizada!',
            text: `Los cambios en "${response.data.name}" se guardaron correctamente`,
            timer: 2000,
            showConfirmButton: false,
          });

          this.loadData();
        },
        error: (error) => {
          console.error('Error al actualizar subcategoría:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error al actualizar',
            text: error.error?.error || 'No se pudo actualizar la subcategoría',
            confirmButtonColor: '#3b82f6',
          });
        },
      });
  }

  confirmDelete() {
    if (!this.deleteTarget) return;

    if (this.deleteTarget.type === 'category') {
      this.adminService.deleteCategory(this.deleteTarget.item.id).subscribe({
        next: (response) => {
          this.closeModals();

          Swal.fire({
            icon: 'success',
            title: '¡Categoría eliminada!',
            text: 'La categoría se ha eliminado correctamente',
            timer: 2000,
            showConfirmButton: false,
          });

          this.loadData();
        },
        error: (error) => {
          console.error('Error al eliminar categoría:', error);
          this.closeModals();
          Swal.fire({
            icon: 'error',
            title: 'Error al eliminar',
            text:
              error.error?.error ||
              'No se pudo eliminar la categoría. Puede que tenga eventos asociados.',
            confirmButtonColor: '#3b82f6',
          });
        },
      });
    } else {
      this.adminService.deleteSubcategory(this.deleteTarget.item.id).subscribe({
        next: (response) => {
          this.closeModals();

          Swal.fire({
            icon: 'success',
            title: '¡Subcategoría eliminada!',
            text: 'La subcategoría se ha eliminado correctamente',
            timer: 2000,
            showConfirmButton: false,
          });

          this.loadData();
        },
        error: (error) => {
          console.error('Error al eliminar subcategoría:', error);
          this.closeModals();
          Swal.fire({
            icon: 'error',
            title: 'Error al eliminar',
            text:
              error.error?.error ||
              'No se pudo eliminar la subcategoría. Puede que tenga eventos asociados.',
            confirmButtonColor: '#3b82f6',
          });
        },
      });
    }
  }
  viewCategoryDetails(category: Category) {
    this.selectedCategory = category;
    this.showCategoryDetailsModal = true;

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
  }

  viewSubcategoryDetails(subcategory: Subcategory) {
    this.selectedSubcategory = subcategory;
    this.showSubcategoryDetailsModal = true;

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
  }

  closeCategoryDetailsModal() {
    this.showCategoryDetailsModal = false;
    this.selectedCategory = null;
  }

  closeSubcategoryDetailsModal() {
    this.showSubcategoryDetailsModal = false;
    this.selectedSubcategory = null;
  }

  trackBySubcategoryId(index: number, subcategory: Subcategory): number {
    return subcategory.id;
  }

  onCategoryIconUploaded(imageUrls: string[]) {
    console.log('🖼️ Icono subido:', imageUrls);
    if (imageUrls.length > 0) {
      this.categoryForm.icon = imageUrls[0];
    }
    console.log('📝 categoryForm actualizado:', this.categoryForm);
  }

  onCategoryImageUploaded(imageUrls: string[]) {
    console.log('🖼️ Imagen subida:', imageUrls);
    if (imageUrls.length > 0) {
      this.categoryForm.image = imageUrls[0];
    }
    console.log('📝 categoryForm actualizado:', this.categoryForm);
  }

  onCategoryIconRemoved(imageUrl: string) {
    this.categoryForm.icon = '';
  }

  onCategoryImageRemoved(imageUrl: string) {
    this.categoryForm.image = '';
  }
}
