import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryService } from '~/app/core/services/categories.service';
import { ICategory } from '~/app/core/models/Categories.model';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css']
})
export class CarouselComponent implements OnInit, OnDestroy {
  @Input() autoPlay: boolean = false;
  @Input() autoPlayInterval: number = 5000;
  @Input() page!: string;

  categories: ICategory[] = [];
  slides: { imageUrl: string; title: string }[] = [];

  currentIndex: number = 0;
  intervalId?: any;

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCarouselItems();
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
  if (this.page === 'categories' || this.page === 'home') {
    this.loadCategories();
  }
}


  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe((data: ICategory[]) => {
      this.categories = data;

      // Mapear al formato del carousel
      this.slides = this.categories.map(cat => ({
        title: cat.name,
        imageUrl: 'assets/categories/rock-metal.jpg'
      }));
    this.categories.forEach(cat => {
      console.log(`Categoría: ${cat.name}`, cat.EventSubcategory);
    });
    });
  }
}
