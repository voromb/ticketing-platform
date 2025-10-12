import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselComponent } from "../../shared/components/list-carousel/carousel.component";
import { ListCard } from "../../shared/components/list-card/list-card";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CarouselComponent, ListCard], 
  templateUrl: './home.html',
})
export class Home  {
  
  events: any[] = []; 

}
