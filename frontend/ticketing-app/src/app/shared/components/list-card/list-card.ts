import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VenuesListComponent } from '../venue/venue.component';
import { Venue } from '~/app/core/models/Venue.model';
import { VenuesService, VenuesResponse } from '~/app/core/services/venues.service';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';

@Component({
  selector: 'app-list-card',
  standalone: true,
  imports: [CommonModule, VenuesListComponent, InfiniteScrollDirective],
  templateUrl: './list-card.html',
  styleUrls: ['./list-card.css']
})
export class ListCard implements OnInit {
  venues: Venue[] = [];
  page = 1;
  limit = 3; // si tu API devuelve totalPages
  loading = false;


constructor(private venuesService: VenuesService) {}

ngOnInit(): void {
  this.loadVenues();
}

loadVenues() {
  if (this.loading) return;
  this.loading = true;

  this.venuesService.getActiveVenues(this.page, this.limit).subscribe({
    next: (res: VenuesResponse) => {
      this.venues = [...this.venues, ...res.venues]; // concatenar nuevos venues
      this.page++; // siguiente página
      this.loading = false;
    },
    error: () => {
      this.loading = false;
    }
  });
}

// Función que se llama al hacer scroll
onScroll() {
  this.loadVenues();
}
}
