import { Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MerchaCard } from '../mercha-card/mercha-card';
import { MerchandisingService, Product } from '~/app/core/services_enterprise/merchandising.service';   


@Component({
  selector: 'app-mercha-list',
  standalone: true,
  imports: [CommonModule, MerchaCard],
  templateUrl: './mercha-list.html',
})
export class MerchaListComponent implements OnInit, OnChanges {
  @Input() festivalId?: string;
  products: Product[] = [];
  loading: boolean = false;

  constructor(
    private merchandisingService: MerchandisingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (this.festivalId) {
      this.loadProducts();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['festivalId'] && this.festivalId) {
      this.loadProducts();
    }
  }

  loadProducts() {
    if (!this.festivalId) return;
    
    this.loading = true;
    this.merchandisingService.getProducts(this.festivalId).subscribe({
      next: (res) => {
        this.products = res;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando productos:', err);
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }
}
