import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  constructor(
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
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
    this.filters = { ...event }; 
  }
}
