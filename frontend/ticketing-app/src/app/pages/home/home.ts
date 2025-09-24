import { Component } from '@angular/core';
import { ListCarousel } from "../../shared/components/list-carousel/list-carousel";
import { ListCard } from "../../shared/components/list-card/list-card";

@Component({
  selector: 'app-home',
  imports: [ListCarousel, ListCard],
  templateUrl: './home.html',
})
export class Home {

}
