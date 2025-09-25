import { Component } from '@angular/core';
import { CarouselComponent } from "../../shared/components/list-carousel/carousel.component";
import { ListCard } from "../../shared/components/list-card/list-card";

@Component({
  selector: 'app-home',
  imports: [CarouselComponent, ListCard],
  templateUrl: './home.html',
})
export class Home {

    //tenim que tirar a un servei per agafar els concerts en el component de carrousel
    concerts = [
    { imageUrl: 'assets/metal1.jpg', title: 'Concierto Metallica' },
    { imageUrl: 'assets/rock1.jpg', title: 'Festival Rock Nacional' },
    { imageUrl: 'assets/metal2.jpg', title: 'Iron Maiden Live' },


  ];

}
