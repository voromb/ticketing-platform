import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselComponent } from "../../shared/components/list-carousel/carousel.component";
import { ListCard } from "../../shared/components/list-card/list-card";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CarouselComponent, ListCard], // <--- solo una vez
  templateUrl: './home.html',
})
export class Home  {
  
  // Array de conciertos de ejemplo (temporal)
  // concerts = [
  //   { imageUrl: 'assets/metal1.jpg', title: 'Concierto Metallica' },
  //   { imageUrl: 'assets/rock1.jpg', title: 'Festival Rock Nacional' },
  //   { imageUrl: 'assets/metal2.jpg', title: 'Iron Maiden Live' },
  // ];

  // ngOnInit() {
  //   console.log('Concerts en OnInit:', this.concerts);
  // }
}
