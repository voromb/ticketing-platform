import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CarouselDetails, CarouselHome } from '~/app/core/models/Carousel.model';


@Component({
  selector: 'app-carousel-card',
  imports: [],
  templateUrl: './carousel-card.html',
  styleUrl: './carousel-card.css'
})
export class CarouselCard {
  @Input() categories!: CarouselHome[];
  @Input() event_details!: CarouselDetails[];
  @Input() page!: string;

  constructor() {}
  ngOnInit(): void {}


}
