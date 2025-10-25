// frontend/ticketing-app/src/app/shared/components/image-upload/image-upload.component.ts
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageUploadService } from '../../../core/services/image-upload.service';
import Swal from 'sweetalert2';

export type UploadType = 'events' | 'venues' | 'categories' | 'subcategories' | 'products';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-4">
      <!-- Título y descripción -->
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          {{ label }}
          <span *ngIf="required" class="text-red-400">*</span>
        </label>
        <p *ngIf="description" class="text-xs text-slate-400 mb-2">
          {{ description }}
        </p>
      </div>

      <!-- Área de drag & drop -->
      <div
        class="border-2 border-dashed rounded-lg p-6 text-center transition-colors"
        [class.border-slate-600]="!isDragging"
        [class.border-violet-500]="isDragging"
        [class.bg-slate-700]="!isDragging"
        [class.bg-violet-900/20]="isDragging"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
      >
        <input
          #fileInput
          type="file"
          [multiple]="multiple"
          [accept]="accept"
          (change)="onFileSelected($event)"
          class="hidden"
        />

        <div class="space-y-2">
          <svg class="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>

          <div class="text-sm text-slate-300">
            <button
              type="button"
              (click)="fileInput.click()"
              class="font-medium text-violet-500 hover:text-violet-400 focus:outline-none"
            >
              Seleccionar archivos
            </button>
            <span class="ml-1">o arrastrar aquí</span>
          </div>

          <p class="text-xs text-slate-400">
            {{ acceptText }} (máx. {{ maxFiles }} archivos, {{ maxSizeMB }}MB c/u)
          </p>
        </div>
      </div>

      <!-- Preview de imágenes -->
      <div *ngIf="previewUrls.length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          *ngFor="let url of previewUrls; let i = index"
          class="relative group"
        >
          <img
            [src]="url"
            [alt]="'Preview ' + (i + 1)"
            class="w-full h-32 object-cover rounded-lg border-2 border-slate-600"
          />
          <button
            type="button"
            (click)="removeImage(i)"
            class="absolute top-2 right-2 bg-violet-500 hover:bg-violet-600 text-white rounded-full p-2 shadow-lg transition-colors border-2 border-white"
            title="Eliminar imagen"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Indicador de carga -->
      <div *ngIf="uploading" class="flex items-center justify-center space-x-2 text-violet-500">
        <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-sm">Subiendo imágenes...</span>
      </div>

      <!-- Botón de upload -->
      <div *ngIf="selectedFiles.length > 0 && !uploading" class="flex justify-end">
        <button
          type="button"
          (click)="uploadImages()"
          class="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors"
        >
          Subir {{ selectedFiles.length }} imagen(es)
        </button>
      </div>
    </div>
  `,
})
export class ImageUploadComponent implements OnInit, OnChanges {
  @Input() label = 'Imágenes';
  @Input() description = '';
  @Input() uploadType: UploadType = 'events';
  @Input() multiple = true;
  @Input() required = false;
  @Input() accept = 'image/jpeg,image/png,image/webp,image/gif';
  @Input() maxFiles = 10;
  @Input() maxSizeMB = 5;
  @Input() existingImages: string[] = [];

  @Output() imagesUploaded = new EventEmitter<string[]>();
  @Output() imageRemoved = new EventEmitter<string>();

  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  isDragging = false;
  uploading = false;

  acceptText = 'PNG, JPG, WEBP, GIF';

  constructor(private imageUploadService: ImageUploadService) {}

  ngOnInit() {
    this.loadExistingImages();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Detectar cuando cambia existingImages
    if (changes['existingImages']) {
      this.loadExistingImages();
    }
  }

  loadExistingImages() {
    // Filtrar imágenes válidas (que tengan contenido)
    const validImages = this.existingImages.filter((img) => img && img.trim() !== '');

    if (validImages.length > 0) {
      // Solo actualizar si hay cambios
      if (JSON.stringify(this.previewUrls) !== JSON.stringify(validImages)) {
        this.previewUrls = [...validImages];
        console.log('🖼️ Cargando imágenes existentes:', this.previewUrls);
      }
    } else if (this.previewUrls.length > 0) {
      // Si no hay imágenes existentes, limpiar previews solo si tenían URLs del servidor
      this.previewUrls = this.previewUrls.filter((url) => url.startsWith('data:'));
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files) {
      this.handleFiles(Array.from(files));
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
    }
  }

  handleFiles(files: File[]) {
    // Validar número de archivos
    const currentServerImages = this.previewUrls.filter((url) => url.startsWith('http')).length;
    const totalAfterUpload = currentServerImages + this.selectedFiles.length + files.length;

    if (totalAfterUpload > this.maxFiles) {
      Swal.fire({
        icon: 'warning',
        title: 'Demasiados archivos',
        text: `Máximo ${this.maxFiles} archivos permitidos`,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
      });
      return;
    }

    // Validar tipo y tamaño de archivos
    const validFiles: File[] = [];
    const maxSize = this.maxSizeMB * 1024 * 1024;

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        Swal.fire({
          icon: 'error',
          title: 'Archivo inválido',
          text: `${file.name} no es una imagen`,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
        });
        continue;
      }

      if (file.size > maxSize) {
        Swal.fire({
          icon: 'error',
          title: 'Archivo muy grande',
          text: `${file.name} excede ${this.maxSizeMB}MB`,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
        });
        continue;
      }

      validFiles.push(file);
    }

    // Agregar archivos válidos
    this.selectedFiles.push(...validFiles);

    // Crear previews
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrls.push(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    });
  }

  async uploadImages() {
    if (this.selectedFiles.length === 0) return;

    this.uploading = true;

    try {
      let uploadObservable;
      
      switch (this.uploadType) {
        case 'events':
          uploadObservable = this.imageUploadService.uploadEventImages(this.selectedFiles);
          break;
        case 'venues':
          uploadObservable = this.imageUploadService.uploadVenueImages(this.selectedFiles);
          break;
        case 'categories':
          uploadObservable = this.imageUploadService.uploadCategoryImages(this.selectedFiles);
          break;
        case 'subcategories':
          uploadObservable = this.imageUploadService.uploadSubcategoryImages(this.selectedFiles);
          break;
        case 'products':
          uploadObservable = this.imageUploadService.uploadProductImages(this.selectedFiles);
          break;
        default:
          throw new Error('Tipo de upload no válido');
      }

      uploadObservable.subscribe({
        next: (response) => {
          this.uploading = false;

          Swal.fire({
            icon: 'success',
            title: '¡Imágenes subidas exitosamente!',
            text: `${response.count} imagen(es) subida(s) correctamente`,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2500,
          });

          console.log('✅ Imágenes subidas al servidor:', response.images);

          // Emitir URLs de las imágenes subidas
          this.imagesUploaded.emit(response.images);

          // Limpiar archivos seleccionados
          this.selectedFiles = [];

          // Reemplazar data URLs con URLs del servidor
          this.previewUrls = this.previewUrls.filter((url) => url.startsWith('http'));
          this.previewUrls.push(...response.images);

          console.log('🖼️ Preview URLs actualizadas:', this.previewUrls);
        },
        error: (error) => {
          this.uploading = false;
          console.error('❌ Error uploading images:', error);
          console.error('📋 Error details:', error.error);
          console.error('📋 Status:', error.status);

          let errorMessage = 'Error desconocido al subir las imágenes';
          let errorTitle = 'Error al subir imágenes';
          
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
          } else if (error.status === 413) {
            errorTitle = 'Archivos muy grandes';
            errorMessage = 'Las imágenes exceden el tamaño máximo permitido.';
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
    } catch (error) {
      this.uploading = false;
      console.error('Error uploading images:', error);
    }
  }

  removeImage(index: number) {
    const imageUrl = this.previewUrls[index];

    Swal.fire({
      title: '¿Eliminar imagen?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        // Remover de previewUrls
        this.previewUrls.splice(index, 1);

        // Si es una imagen del servidor (existente), emitir evento para notificar al padre
        if (imageUrl.startsWith('http')) {
          this.imageRemoved.emit(imageUrl);
        }

        // Si es una imagen en preview (selectedFiles), también removerla
        if (index < this.selectedFiles.length) {
          this.selectedFiles.splice(index, 1);
        }

        Swal.fire({
          icon: 'success',
          title: 'Imagen eliminada',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000,
        });
      }
    });
  }

  getUploadedUrls(): string[] {
    return this.previewUrls.filter((url) => url.startsWith('http'));
  }
}
