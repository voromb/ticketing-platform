import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { AdminService, type Category, type Subcategory, type CategoryStats } from '../../../core/services/admin.service';

@Component({
  selector: 'app-categories-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="p-8 pb-16 space-y-8">
      <!-- Header con estadísticas -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white">Gestión de Categorías</h1>
          <p class="mt-2 text-sm text-slate-300">
            Administra categorías y subcategorías de eventos
          </p>
        </div>
        <div class="mt-4 sm:mt-0 flex space-x-3">
          <button (click)="openCreateCategoryModal()"
                  style="border-radius: 24px;"
                  class="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium text-white bg-gray-700 hover:bg-gray-800 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Nueva Categoría
          </button>
          <button (click)="openCreateSubcategoryModal()"
                  style="border-radius: 24px;"
                  class="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
            Nueva Subcategoría
          </button>
        </div>
      </div>

      <!-- Estadísticas -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700/50 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
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

        <div class="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700/50 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
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

        <div class="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700/50 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
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
      <div *ngIf="!loading" class="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700/50">
        <!-- Tabs -->
        <div class="border-b border-slate-700">
          <nav class="-mb-px flex space-x-8 px-8 pt-6">
            <button (click)="switchTab('categories')"
                    [class]="activeTab === 'categories' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300'"
                    class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200">
              Categorías ({{ totalCategories }})
            </button>
            <button (click)="switchTab('subcategories')"
                    [class]="activeTab === 'subcategories' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300'"
                    class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200">
              Subcategorías ({{ totalSubcategories }})
            </button>
          </nav>
        </div>

        <!-- Filtros -->
        <div class="p-8 border-b border-slate-700">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-white mb-2">
                Buscar
              </label>
              <input [(ngModel)]="searchTerm"
                     (input)="onSearch()"
                     type="text"
                     [placeholder]="activeTab === 'categories' ? 'Nombre de categoría...' : 'Nombre de subcategoría...'"
                     class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-white placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            </div>

            <div>
              <label class="block text-sm font-medium text-white mb-2">
                Ordenar por
              </label>
              <select [(ngModel)]="sortBy"
                      (change)="onSort(sortBy)"
                      class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                <option value="name">Nombre</option>
                <option value="events">Eventos</option>
                <option *ngIf="activeTab === 'categories'" value="subcategories">Subcategorías</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-white mb-2">
                Orden
              </label>
              <select [(ngModel)]="sortOrder"
                      (change)="activeTab === 'categories' ? applyFilters() : applySubcategoryFilters()"
                      class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500">
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
                  <th class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Subcategorías
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Eventos
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-700">
                <tr *ngFor="let category of filteredCategories" class="hover:bg-slate-700/50 transition-colors duration-200">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-8 w-8">
                        <div class="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                          <span class="text-sm font-medium text-white">{{ category.name.charAt(0).toUpperCase() }}</span>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-white">{{ category.name }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-600 text-slate-200">
                      {{ category._count?.subcategories || 0 }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-600 text-green-100">
                      {{ category._count?.events || 0 }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex justify-end space-x-2">
                      <button (click)="viewCategoryDetails(category)"
                              class="text-green-400 hover:text-green-300 transition-colors duration-200"
                              title="Ver detalles">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                      </button>
                      <button (click)="openEditCategoryModal(category)"
                              class="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                              title="Editar">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                      </button>
                      <button (click)="openDeleteModal('category', category)"
                              class="text-red-400 hover:text-red-300 transition-colors duration-200"
                              title="Eliminar">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            
            <div *ngIf="filteredCategories.length === 0" class="text-center py-12">
              <svg class="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
              </svg>
              <h3 class="mt-2 text-sm font-medium text-slate-300">No hay categorías</h3>
              <p class="mt-1 text-sm text-slate-400">Comienza creando una nueva categoría.</p>
            </div>
          </div>
        </div>

        <!-- Tabla de Subcategorías -->
        <div *ngIf="activeTab === 'subcategories'" class="p-8">
          <!-- Debug info -->
          <div class="mb-4 text-xs text-slate-400">
            Debug: {{ filteredSubcategories.length }} subcategorías filtradas de {{ subcategories.length }} totales
          </div>
          
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-700">
              <thead>
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Subcategoría
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Categoría Padre
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Eventos
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-700">
                <tr *ngFor="let subcategory of filteredSubcategories; let i = index" class="hover:bg-slate-700/50 transition-colors duration-200">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-8 w-8">
                        <div class="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                          <span class="text-sm font-medium text-white">{{ subcategory.name.charAt(0).toUpperCase() }}</span>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-white">{{ subcategory.name }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-600 text-blue-100">
                      {{ subcategory.category?.name }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-600 text-green-100">
                      {{ subcategory._count?.events || 0 }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex justify-end space-x-2">
                      <button (click)="viewSubcategoryDetails(subcategory)"
                              class="text-green-400 hover:text-green-300 transition-colors duration-200"
                              title="Ver detalles">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                      </button>
                      <button (click)="openEditSubcategoryModal(subcategory)"
                              class="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                              title="Editar">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                      </button>
                      <button (click)="openDeleteModal('subcategory', subcategory)"
                              class="text-red-400 hover:text-red-300 transition-colors duration-200"
                              title="Eliminar">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            
            <div *ngIf="filteredSubcategories.length === 0" class="text-center py-12">
              <svg class="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
              </svg>
              <h3 class="mt-2 text-sm font-medium text-slate-300">No hay subcategorías</h3>
              <p class="mt-1 text-sm text-slate-400">Comienza creando una nueva subcategoría.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Modales -->
      <!-- Modal Crear Categoría -->
      <div *ngIf="showCreateCategoryModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-slate-800 rounded-xl p-6 w-full max-w-md mx-4">
          <h3 class="text-lg font-medium text-white mb-4">Nueva Categoría</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-white mb-2">Nombre</label>
              <input [(ngModel)]="categoryForm.name" type="text" placeholder="Nombre de la categoría"
                     class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            </div>
          </div>
          <div class="flex justify-end space-x-3 mt-6">
            <button (click)="closeModals()" class="px-4 py-2 text-slate-300 hover:text-white transition-colors">
              Cancelar
            </button>
            <button (click)="createCategory()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
              Crear
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Editar Categoría -->
      <div *ngIf="showEditCategoryModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-slate-800 rounded-xl p-6 w-full max-w-md mx-4">
          <h3 class="text-lg font-medium text-white mb-4">Editar Categoría</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-white mb-2">Nombre</label>
              <input [(ngModel)]="categoryForm.name" type="text" placeholder="Nombre de la categoría"
                     class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            </div>
          </div>
          <div class="flex justify-end space-x-3 mt-6">
            <button (click)="closeModals()" class="px-4 py-2 text-slate-300 hover:text-white transition-colors">
              Cancelar
            </button>
            <button (click)="updateCategory()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
              Actualizar
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Crear Subcategoría -->
      <div *ngIf="showCreateSubcategoryModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-slate-800 rounded-xl p-6 w-full max-w-md mx-4">
          <h3 class="text-lg font-medium text-white mb-4">Nueva Subcategoría</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-white mb-2">Categoría Padre</label>
              <select [(ngModel)]="subcategoryForm.categoryId"
                      class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                <option [value]="0">Seleccionar categoría</option>
                <option *ngFor="let category of categories" [value]="category.id">{{ category.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-white mb-2">Nombre</label>
              <input [(ngModel)]="subcategoryForm.name" type="text" placeholder="Nombre de la subcategoría"
                     class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            </div>
          </div>
          <div class="flex justify-end space-x-3 mt-6">
            <button (click)="closeModals()" class="px-4 py-2 text-slate-300 hover:text-white transition-colors">
              Cancelar
            </button>
            <button (click)="createSubcategory()" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors">
              Crear
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Editar Subcategoría -->
      <div *ngIf="showEditSubcategoryModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-slate-800 rounded-xl p-6 w-full max-w-md mx-4">
          <h3 class="text-lg font-medium text-white mb-4">Editar Subcategoría</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-white mb-2">Categoría Padre</label>
              <select [(ngModel)]="subcategoryForm.categoryId"
                      class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                <option *ngFor="let category of categories" [value]="category.id">{{ category.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-white mb-2">Nombre</label>
              <input [(ngModel)]="subcategoryForm.name" type="text" placeholder="Nombre de la subcategoría"
                     class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            </div>
          </div>
          <div class="flex justify-end space-x-3 mt-6">
            <button (click)="closeModals()" class="px-4 py-2 text-slate-300 hover:text-white transition-colors">
              Cancelar
            </button>
            <button (click)="updateSubcategory()" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors">
              Actualizar
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Eliminar -->
      <div *ngIf="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-slate-800 rounded-xl p-6 w-full max-w-md mx-4">
          <h3 class="text-lg font-medium text-white mb-4">Confirmar Eliminación</h3>
          <p class="text-slate-300 mb-6">
            ¿Estás seguro de que quieres eliminar esta {{ deleteTarget?.type === 'category' ? 'categoría' : 'subcategoría' }}?
          </p>
          <div class="flex justify-end space-x-3">
            <button (click)="closeModals()" class="px-4 py-2 text-slate-300 hover:text-white transition-colors">
              Cancelar
            </button>
            <button (click)="confirmDelete()" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors">
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class CategoriesListComponent implements OnInit {
  // ============= PROPIEDADES PRINCIPALES =============
  categories: Category[] = [];
  subcategories: Subcategory[] = [];
  filteredCategories: Category[] = [];
  filteredSubcategories: Subcategory[] = [];
  
  // ============= ESTADOS =============
  loading = false;
  activeTab: 'categories' | 'subcategories' = 'categories';
  
  // ============= ESTADÍSTICAS =============
  totalCategories = 0;
  totalSubcategories = 0;
  categoriesWithEvents = 0;
  
  // ============= FILTROS Y BÚSQUEDA =============
  searchTerm = '';
  sortBy: 'name' | 'events' | 'subcategories' = 'name';
  sortOrder: 'asc' | 'desc' = 'asc';
  
  // ============= MODALES =============
  showCreateCategoryModal = false;
  showEditCategoryModal = false;
  showCreateSubcategoryModal = false;
  showEditSubcategoryModal = false;
  showDeleteModal = false;
  
  // ============= FORMULARIOS =============
  categoryForm = {
    id: 0,
    name: ''
  };
  
  subcategoryForm = {
    id: 0,
    categoryId: 0,
    name: ''
  };
  
  // ============= ITEM SELECCIONADO =============
  selectedCategory: Category | null = null;
  selectedSubcategory: Subcategory | null = null;
  deleteTarget: { type: 'category' | 'subcategory', item: any } | null = null;

  constructor(
    private adminService: AdminService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadData();
  }

  // ============= CARGA DE DATOS =============
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
      }
    });
  }

  loadSubcategories() {
    console.log('Cargando subcategorías...');
    this.adminService.getSubcategories().subscribe({
      next: (response) => {
        console.log('Subcategorías recibidas:', response);
        console.log('Datos de subcategorías:', response.data);
        this.subcategories = response.data || [];
        this.filteredSubcategories = [...this.subcategories];
        console.log('Subcategorías asignadas:', this.subcategories);
        console.log('Subcategorías filtradas:', this.filteredSubcategories);
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
      }
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
      }
    });
  }

  // ============= FILTROS Y ORDENACIÓN =============
  applyFilters() {
    let filtered = [...this.categories];

    // Filtro por búsqueda
    if (this.searchTerm) {
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Ordenación
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

    // Filtro por búsqueda
    if (this.searchTerm) {
      filtered = filtered.filter(subcategory =>
        subcategory.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        subcategory.category?.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Ordenación
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

  // ============= CAMBIO DE TABS =============
  switchTab(tab: 'categories' | 'subcategories') {
    console.log('Cambiando a tab:', tab);
    this.activeTab = tab;
    this.searchTerm = '';
    this.sortBy = 'name';
    this.sortOrder = 'asc';
    
    if (tab === 'categories') {
      this.applyFilters();
    } else {
      console.log('Cargando subcategorías para el tab...');
      this.loadSubcategories(); // Recargar subcategorías cuando cambias al tab
      this.applySubcategoryFilters();
    }
  }

  // ============= MÉTODOS DE MODAL =============
  openCreateCategoryModal() {
    this.categoryForm = { id: 0, name: '' };
    this.showCreateCategoryModal = true;
  }

  openEditCategoryModal(category: Category) {
    this.categoryForm = { id: category.id, name: category.name };
    this.selectedCategory = category;
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
      name: subcategory.name 
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
    this.selectedCategory = null;
    this.selectedSubcategory = null;
    this.deleteTarget = null;
  }

  // ============= MÉTODOS CRUD =============
  createCategory() {
    console.log('Intentando crear categoría:', this.categoryForm.name);
    if (!this.categoryForm.name.trim()) {
      console.log('Nombre vacío, cancelando');
      return;
    }

    this.adminService.createCategory({ name: this.categoryForm.name }).subscribe({
      next: (response) => {
        console.log('Categoría creada exitosamente:', response);
        console.log('Cerrando modal de categoría...');
        this.showCreateCategoryModal = false;
        this.categoryForm = { id: 0, name: '' };
        this.loadData();
        
        setTimeout(() => {
          this.cdr.detectChanges();
        }, 100);
      },
      error: (error) => {
        console.error('Error al crear categoría:', error);
      }
    });
  }

  updateCategory() {
    if (!this.categoryForm.name.trim() || !this.selectedCategory) return;

    this.adminService.updateCategory(this.selectedCategory.id, { 
      name: this.categoryForm.name 
    }).subscribe({
      next: (response) => {
        console.log('Categoría actualizada:', response.message);
        this.closeModals();
        this.loadData();
      },
      error: (error) => {
        console.error('Error al actualizar categoría:', error);
      }
    });
  }

  createSubcategory() {
    console.log('Intentando crear subcategoría:', this.subcategoryForm);
    if (!this.subcategoryForm.name.trim() || !this.subcategoryForm.categoryId) {
      console.log('Datos incompletos para crear subcategoría');
      return;
    }

    const subcategoryData = {
      categoryId: Number(this.subcategoryForm.categoryId), // Asegurar que es número
      name: this.subcategoryForm.name.trim()
    };

    console.log('Datos a enviar:', subcategoryData);

    this.adminService.createSubcategory(subcategoryData).subscribe({
      next: (response) => {
        console.log('Subcategoría creada exitosamente:', response);
        console.log('Cerrando modal...');
        this.showCreateSubcategoryModal = false;
        this.subcategoryForm = { id: 0, categoryId: 0, name: '' };
        this.loadData(); // Esto recarga todo incluyendo subcategorías
        
        setTimeout(() => {
          this.cdr.detectChanges();
        }, 100);
      },
      error: (error) => {
        console.error('Error al crear subcategoría:', error);
        console.error('Detalles del error:', error.error);
      }
    });
  }

  updateSubcategory() {
    if (!this.subcategoryForm.name.trim() || !this.selectedSubcategory) return;

    this.adminService.updateSubcategory(this.selectedSubcategory.id, {
      categoryId: this.subcategoryForm.categoryId,
      name: this.subcategoryForm.name
    }).subscribe({
      next: (response) => {
        console.log('Subcategoría actualizada:', response.message);
        this.closeModals();
        this.loadData();
      },
      error: (error) => {
        console.error('Error al actualizar subcategoría:', error);
      }
    });
  }

  confirmDelete() {
    if (!this.deleteTarget) return;

    if (this.deleteTarget.type === 'category') {
      this.adminService.deleteCategory(this.deleteTarget.item.id).subscribe({
        next: (response) => {
          console.log('Categoría eliminada:', response.message);
          this.closeModals();
          this.loadData();
        },
        error: (error) => {
          console.error('Error al eliminar categoría:', error);
        }
      });
    } else {
      this.adminService.deleteSubcategory(this.deleteTarget.item.id).subscribe({
        next: (response) => {
          console.log('Subcategoría eliminada:', response.message);
          this.closeModals();
          this.loadData();
        },
        error: (error) => {
          console.error('Error al eliminar subcategoría:', error);
        }
      });
    }
  }

  // ============= VER DETALLES =============
  viewCategoryDetails(category: Category) {
    console.log('Ver detalles de categoría:', category);
    alert(`Categoría: ${category.name}\nSubcategorías: ${category._count?.subcategories || 0}\nEventos: ${category._count?.events || 0}`);
  }

  viewSubcategoryDetails(subcategory: Subcategory) {
    console.log('Ver detalles de subcategoría:', subcategory);
    alert(`Subcategoría: ${subcategory.name}\nCategoría padre: ${subcategory.category?.name}\nEventos: ${subcategory._count?.events || 0}`);
  }

  // ============= TRACK BY FUNCTIONS =============
  trackBySubcategoryId(index: number, subcategory: Subcategory): number {
    return subcategory.id;
  }
}
