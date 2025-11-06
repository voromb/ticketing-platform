import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Product } from '~/app/core/services_enterprise/merchandising.service';
import { MerchStateService } from '~/app/core/services/merch-state.service';
import { Subscription } from 'rxjs';

    
@Component({
  selector: 'app-mercha-card',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './mercha-card.html',
  styleUrls: ['./mercha-card.css'],
})
export class MerchaCard implements OnInit, OnDestroy { 

  @Input() product!: Product;
  isSelected = false;
  private subscription?: Subscription;

  constructor(private merchStateService: MerchStateService) {}

  ngOnInit(): void {
    // Verificar estado inicial
    this.isSelected = this.merchStateService.isProductSelected(this.product);
    
    // Suscribirse a cambios en la selección
    this.subscription = this.merchStateService.selectedProducts$.subscribe(() => {
      this.isSelected = this.merchStateService.isProductSelected(this.product);
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  toggleProduct(): void {
    this.merchStateService.toggleProduct(this.product);
  }
}