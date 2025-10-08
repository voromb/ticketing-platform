import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface FiltersPayload {
  categoryId: number | null;
  minPrice: number | null;
  maxPrice: number | null;
}

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './filters.html',
  styleUrls: ['./filters.css']
})
export class FiltersComponent {
  @Input() listCategories: { id: number; name: string; slug?: string }[] = [];
  @Output() eventofiltros = new EventEmitter<FiltersPayload>();

  form!: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      categoryId: [null as number | null],
      minPrice: [null as number | null],
      maxPrice: [null as number | null],
    });
  }

  emitir() {
    const { categoryId, minPrice, maxPrice } = this.form.value as FiltersPayload;
    this.eventofiltros.emit({
      categoryId: categoryId ?? null,
      minPrice: minPrice !== null && minPrice !== undefined && minPrice !== ('' as any)
        ? Number(minPrice) : null,
      maxPrice: maxPrice !== null && maxPrice !== undefined && maxPrice !== ('' as any)
        ? Number(maxPrice) : null,
    });
  }

  reset() {
    this.form.reset({ categoryId: null, minPrice: null, maxPrice: null });
    this.emitir();
  }
}
