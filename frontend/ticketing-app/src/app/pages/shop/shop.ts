import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventsComponent } from '~/app/shared/components/events/events.component';

@Component({
  selector: 'app-shop',
  standalone: true,              // 👈 importante para loadComponent
  imports: [CommonModule, EventsComponent], // 👈 importamos VenuesList y CommonModule
  templateUrl: './shop.html',
})
export class Shop {}
