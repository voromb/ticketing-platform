import { Component } from '@angular/core';
import { ListCarousel } from "../../components/list-carousel/list-carousel";
import { ListCard } from "../../components/list-card/list-card";

@Component({
  selector: 'app-home',
  imports: [ListCarousel, ListCard],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {

}
