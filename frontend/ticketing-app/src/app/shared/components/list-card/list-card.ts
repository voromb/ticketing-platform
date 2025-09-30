import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VenuesListComponent } from '../venue/venue.component';
import { Venue } from '~/app/core/models/Venue.model';
import { VenuesService, VenuesResponse } from '~/app/core/services/venues.service';

@Component({
  selector: 'app-list-card',
  standalone: true,
  imports: [CommonModule, VenuesListComponent],
  templateUrl: './list-card.html',
  styleUrls: ['./list-card.css']
})
export class ListCard implements OnInit {
  venues: Venue[] = [];

  constructor(private venuesService: VenuesService) {}

  ngOnInit(): void {
    this.venuesService.getActiveVenues(1, 10).subscribe({
      next: (res: VenuesResponse) => {
        this.venues = res.venues;
        console.log('📦 Venues recibidos en ListCard:', this.venues);
      },
      error: (err) => console.error('❌ Error cargando venues:', err)
    });
  }
}
