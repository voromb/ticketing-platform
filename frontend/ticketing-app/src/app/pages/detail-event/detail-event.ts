import { Component } from '@angular/core';
import { IEvent } from '~/app/core/models/Event.model';
import { CarouselComponent } from '~/app/shared/components/list-carousel/carousel.component';

@Component({
  selector: 'app-detail-event',
  imports: [CarouselComponent],
  templateUrl: './detail-event.html',
})
export class DetailEvent {

  events: IEvent[] = [];
concerts = [
  { imageUrl: 'assets/metal1.jpg', title: 'Concierto Metallica' },
  { imageUrl: 'assets/rock1.jpg', title: 'Festival Rock Nacional' },
  { imageUrl: 'assets/metal2.jpg', title: 'Iron Maiden Live' },
];

ngOnInit() {
  console.log('Events en OnInit:', this.events);
  console.log('Concerts en OnInit:', this.concerts);
}

}
