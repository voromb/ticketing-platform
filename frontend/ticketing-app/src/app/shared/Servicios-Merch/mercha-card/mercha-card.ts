import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Product } from '~/app/core/services_enterprise/merchandising.service';

    
@Component({
  selector: 'app-mercha-card',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './mercha-card.html',
  styleUrls: ['./mercha-card.css'],
})
export class MerchaCard { 

@Input() product!: Product;



}