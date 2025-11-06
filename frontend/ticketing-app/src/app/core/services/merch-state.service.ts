import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../services_enterprise/merchandising.service';

@Injectable({
  providedIn: 'root'
})
export class MerchStateService {
  // BehaviorSubject almacena el estado de los productos seleccionados (Product[])
  private selectedProductsSubject = new BehaviorSubject<Product[]>([]);
  
  // Observable para que otros componentes se suscriban
  public selectedProducts$: Observable<Product[]> = 
    this.selectedProductsSubject.asObservable();

  constructor() { }

  // Método para obtener el valor actual de forma síncrona
  getCurrentSelectedProducts(): Product[] {
    return this.selectedProductsSubject.getValue();
  }

  // Método clave para añadir/quitar un producto (llamado desde MerchaCard)
  toggleProduct(product: Product): void {
    const currentProducts = this.getCurrentSelectedProducts();
    const index = currentProducts.findIndex(p => p._id === product._id);
    
    let newProducts: Product[];
    if (index > -1) {
      // Quitar el producto
      newProducts = currentProducts.filter(p => p._id !== product._id);
    } else {
      // Añadir el producto
      newProducts = [...currentProducts, product];
    }
    
    // Notificar a todos los suscriptores (incluyendo EventDetailComponent)
    this.selectedProductsSubject.next(newProducts);
  }

  // Método para verificar si un producto está seleccionado
  isProductSelected(product: Product): boolean {
    const currentProducts = this.getCurrentSelectedProducts();
    return currentProducts.some(p => p._id === product._id);
  }

  // Método para resetear la selección (llamado desde EventDetailComponent al cerrar el modal)
  clearSelection(): void {
    this.selectedProductsSubject.next([]);
  }
}

