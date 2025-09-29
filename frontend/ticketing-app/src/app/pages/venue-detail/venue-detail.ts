import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VenueDetailPage } from '~/app/shared/components/venue-detail/venue_detail.component';

@Component({
  selector: 'app-venue_details',
  standalone: true,              
  imports: [CommonModule, VenueDetailPage], 
  templateUrl: './venue-detail.html',
})
export class VenueDetail {}