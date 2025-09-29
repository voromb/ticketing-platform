import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VenuesListComponent } from '~/app/shared/components/venue/venue.component';

@Component({
  selector: 'app-shop',
  standalone: true,              // 👈 importante para loadComponent
  imports: [CommonModule, VenuesListComponent], // 👈 importamos VenuesList y CommonModule
  templateUrl: './shop.html',
})
export class Shop {}
