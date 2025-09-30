
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Venue } from '~/app/core/models/Venue.model';

@Component({
  selector: 'app-venues-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './venue.component.html',
  styleUrls: ['./venue.component.css']
})
export class VenuesListComponent {
  @Input() venue!: Venue;
}

