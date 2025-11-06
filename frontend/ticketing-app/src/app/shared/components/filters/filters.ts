import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ICategory } from '~/app/core/models/Categories.model';

export interface FiltersPayload {
  categoryId?: number | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  venueSlug?: string | null; 
}

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './filters.html',
  styleUrl: './filters.css'
})
export class FiltersComponent implements OnInit, OnChanges {
  @Input() listCategories: ICategory[] = [];
  @Output() filtersChanged = new EventEmitter<FiltersPayload>(); 

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      categoryId: [null],
      minPrice: [null],
      maxPrice: [null],
    });
  }

  ngOnInit(): void {
    console.log('🔍 FiltersComponent - Categorías recibidas en ngOnInit:', this.listCategories);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['listCategories']) {
      console.log('🔍 FiltersComponent - Categorías cambiaron:', this.listCategories);
      console.log('🔍 Cantidad de categorías:', this.listCategories?.length);
    }
  }

  applyFilters(): void {
    const values = this.form.value;
    this.filtersChanged.emit({
      categoryId: values.categoryId ?? null,
      minPrice: values.minPrice ?? null,
      maxPrice: values.maxPrice ?? null,
    });
  }

  resetFilters(): void {
    this.form.reset();
    this.filtersChanged.emit({});
  }

  reset(): void {
    this.form.reset();
    this.filtersChanged.emit({});
  }
}
