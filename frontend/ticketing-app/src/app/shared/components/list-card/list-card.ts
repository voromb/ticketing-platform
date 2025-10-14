import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  styleUrls: ['./list-card.css'],
})
export class ListCard implements OnInit {
  venues: Venue[] = [];
  page = 1;
  limit = 4;
  loading = false;

  constructor(private venuesService: VenuesService, private cdr: ChangeDetectorRef) {
    console.log('🏗️ ListCard constructor called');
  }

  ngOnInit(): void {
    console.log('🚀 ListCard ngOnInit called');
    this.loadVenues();
  }

  loadVenues() {
    if (this.loading) return;

    console.log('🔄 Loading venues...', { page: this.page, limit: this.limit });
    this.loading = true;

    this.venuesService.getActiveVenues(this.page, this.limit).subscribe({
      next: (res: VenuesResponse) => {
        console.log('✅ Venues recibidos:', res);
        this.venues = [...this.venues, ...res.venues];
        this.page++;
        this.loading = false;
        this.cdr.detectChanges(); // Forzar detección de cambios
      },
      error: (err: any) => {
        console.error('❌ Error cargando venues:', err);
        this.loading = false;
        this.cdr.detectChanges(); // Forzar detección de cambios
      },
    });
  }

  // Función que se llama al hacer scroll
  onScroll() {
    console.log('📜 Scroll detected, loading more venues...');
    this.loadVenues();
  }
}
