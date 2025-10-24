import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FiltersComponent, FiltersPayload } from '~/app/shared/components/filters/filters';
import { EventsComponent } from '~/app/shared/components/events/events.component';
import { CategoryService } from '~/app/core/services/categories.service';
import { ICategory } from '~/app/core/models/Categories.model';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, FiltersComponent, EventsComponent],
  templateUrl: './shop.html',
})
export class Shop implements OnInit {
  listCategories: ICategory[] = [];
  filters: FiltersPayload = {}; 
  venueSlug: string | null = null;

  constructor(
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

   ngOnInit(): void {
    // 🔹 Leer el query param del venue
    this.route.queryParams.subscribe(params => {
      this.venueSlug = params['venueSlug'] || null;

      if (this.venueSlug) {
        console.log('📍 Venue slug recibido:', this.venueSlug);

        // Mezclamos el venueSlug con los filtros existentes
        this.filters = { 
          ...this.filters, 
          venueSlug: this.venueSlug 
        };
      }
    });

    // 🔹 Cargar categorías
    this.categoryService.getAllCategories().subscribe({
      next: (cats) => {
        this.listCategories = cats;
        this.cdr.detectChanges();
      },
      error: () => {
        this.listCategories = [];
      },
    });
  }

  onFiltersChanged(event: FiltersPayload) {
    console.log('🟢 Filtros aplicados desde Shop:', event);
    // Combinamos los filtros del usuario con el venue actual
    this.filters = { 
      ...event, 
      ...(this.venueSlug ? { venueSlug: this.venueSlug } : {}) 
    };
  }
}