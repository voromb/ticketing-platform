import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface FiltersPayload {
  categoryId?: number | string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
}

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './filters.html',
})
export class FiltersComponent {
  @Input() listCategories: { id: number; name: string }[] = [];
  @Output() filtersChanged = new EventEmitter<FiltersPayload>(); 

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      categoryId: [null],
      minPrice: [null],
      maxPrice: [null],
    });
  }

  applyFilters(): void {
    const values = this.form.value;
    this.filtersChanged.emit({
      categoryId: values.categoryId ?? null,
      minPrice: values.minPrice ?? null,
      maxPrice: values.maxPrice ?? null,
    });
  }

  reset(): void {
    this.form.reset();
    this.filtersChanged.emit({});
  }
}
