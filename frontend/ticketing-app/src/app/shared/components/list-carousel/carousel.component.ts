import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselDetails, CarouselHome } from '~/app/core/models/Carousel.model';
import { CarouselService } from '~/app/core/services/carousel.service';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css']
})
export class CarouselComponent implements OnInit, OnDestroy {
  @Input() slides: { imageUrl: string; title: string }[] = [];
  @Input() autoPlay: boolean = false;
  @Input() autoPlayInterval: number = 5000;
  @Input() page!: string;
  items_carousel!: CarouselHome[];
  items_details!: CarouselDetails[];
  slug_details!: string | null;

  currentIndex: number = 0;
  intervalId?: any;

  constructor(
    private carouselService: CarouselService
  ) {}

  ngOnInit(): void {
    if (this.autoPlay) this.startAutoPlay();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  next(): void {
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
  }

  prev(): void {
    this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
  }

  goTo(index: number): void {
    this.currentIndex = index;
  }

  startAutoPlay(): void {
    this.intervalId = setInterval(() => this.next(), this.autoPlayInterval);
  }

  stopAutoPlay(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  loadCarouselItems(): void {
    if (this.page === 'home'){
      this.carousel_categories();
    }else if (this.page === 'details' && this.slug_details ){
      this.carousel_shop_details();
    }
  }
    carousel_categories(): void {
    this.carouselService.getCarouselHome().subscribe((data: any) => {
      this.items_carousel = data.categories;
    });
  }

  carousel_shop_details(): void {
    this.carouselService
      .getCarouselDetails(this.slug_details)
      .subscribe((data: any) => {
        this.items_details = data.events.images;
      });
  }
}
