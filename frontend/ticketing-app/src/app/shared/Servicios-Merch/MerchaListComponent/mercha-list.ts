import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MerchaCard } from '../mercha-card/mercha-card';
import { MerchandisingService, Product } from '~/app/core/services_enterprise/merchandising.service';   


@Component({
  selector: 'app-mercha-list',
  standalone: true,
  imports: [CommonModule, MerchaCard],
  templateUrl: './mercha-list.html',
})
export class MerchaListComponent implements OnInit {
  @Input() festivalId?: string;
  products: Product[] = [];

  constructor(private merchandisingService: MerchandisingService) {}

   ngOnInit() {
    this.loadProducts();
  }

  ngOnChanges(changes: SimpleChanges) {
  if (changes['festivalId'] && this.festivalId) {
    this.loadProducts();
  }
}
    loadProducts() {
    this.merchandisingService.getProducts(this.festivalId).subscribe({
      next: (res) => (this.products = res),
      error: (err) => console.error('Error cargando productos:', err),
    });
  }
}
