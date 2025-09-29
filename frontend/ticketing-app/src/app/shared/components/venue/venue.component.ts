import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VenuesService, VenuesResponse } from '~/app/core/services/venues.service';
import { Venue } from '~/app/core/models/Venue.model';

@Component({
  selector: 'app-venues-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./venue.component.html"
})
export class VenuesListComponent implements OnInit {
  venues: Venue[] = [];
  total: number = 0;

  constructor(private venuesService: VenuesService) {}

  ngOnInit(): void {
    // ✅ Esto hace que se carguen los venues automáticamente
    this.loadVenues();
  }

  loadVenues(page: number = 1): void {
    this.venuesService.getActiveVenues(page, 10).subscribe({
      next: (res: VenuesResponse) => {
        console.log('Respuesta API:', res);
        this.venues = res.venues;
        this.total = res.pagination.total;
      },
      error: (err) => {
        console.error('Error al cargar venues:', err);
      }
    });
  }
}
