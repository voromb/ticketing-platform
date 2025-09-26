import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

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

  currentIndex: number = 0;
  intervalId?: any;

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
}
