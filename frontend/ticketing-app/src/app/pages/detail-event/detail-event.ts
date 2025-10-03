import { Component } from '@angular/core';
import { IEvent } from '~/app/core/models/Event.model';
import { CarouselComponent } from '~/app/shared/components/list-carousel/carousel.component';

@Component({
  selector: 'app-detail-event',
  standalone: true,
  imports: [CarouselComponent],
  templateUrl: './detail-event.html',
})
export class DetailEvent {

  events: IEvent[] = [];


}
