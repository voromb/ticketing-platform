import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { VenuesService } from '~/app/core/services/venues.service';
import { Venue } from '~/app/core/models/Venue.model';

@Component({
  selector: 'app-venue-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './venue_detail.component.html',
})
export class VenueDetailPage implements OnInit {
  venue?: Venue;

  constructor(
    private route: ActivatedRoute,
    private venuesService: VenuesService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.venuesService.getVenueById(id).subscribe({
        next: (res) => (this.venue = res),
        error: (err) => console.error('Error al cargar venue', err),
      });
    }
  }
}
