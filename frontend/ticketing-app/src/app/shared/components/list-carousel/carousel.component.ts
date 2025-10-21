import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryService } from '~/app/core/services/categories.service';
import { ICategory } from '~/app/core/models/Categories.model';
import { IEvent } from '~/app/core/models/Event.model'; 

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css']
})
export class CarouselComponent implements OnInit, OnDestroy, OnChanges {
  @Input() autoPlay: boolean = false;
  @Input() autoPlayInterval: number = 5000;
  @Input() page!: 'home' | 'shop' | 'details';
  @Input() eventImages: (string | IEvent)[] = [];
  categories: ICategory[] = [];
  iEvent: IEvent[]=[];
  slides: { imageUrl: string; title?: string }[] = [];

  currentIndex: number = 0;
  intervalId?: any;

  constructor(
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCarouselItems();
    if (this.autoPlay) this.startAutoPlay();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Detectar cambios en eventImages para recargar el carousel
    if (changes['eventImages'] && !changes['eventImages'].firstChange) {
      console.log('🔄 Cambios detectados en eventImages, recargando carousel...');
      // Usar setTimeout para evitar el error NG0100
      setTimeout(() => {
        this.loadCarouselItems();
        this.cdr.detectChanges();
      }, 0);
    }
    
    // Detectar cambios en page para recargar el carousel
    if (changes['page'] && !changes['page'].firstChange) {
      console.log('🔄 Cambios detectados en page, recargando carousel...');
      // Usar setTimeout para evitar el error NG0100
      setTimeout(() => {
        this.loadCarouselItems();
        this.cdr.detectChanges();
      }, 0);
    }
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
    switch (this.page) {
      case 'home':
      case 'shop':
        this.loadCategories();
        break;
      case 'details':
        this.loadEventImages();
        break;
      default:
        console.warn('⚠️ Página desconocida, no se cargaron elementos del carrusel');
        break;
    }
  }

  private loadCategories(): void {
    this.categoryService.getAllCategories().subscribe((data: ICategory[]) => {
      this.categories = data;

      // Usar setTimeout para evitar el error NG0100
      setTimeout(() => {
        this.slides = this.categories.map(cat => ({
          title: cat.name,
          imageUrl: cat.image || 'assets/categories/rock-metal.jpg'
        }));
        this.cdr.detectChanges();
      }, 0);
    });
  }
private loadEventImages(): void {
  if (!this.eventImages || this.eventImages.length === 0) {
    console.warn('⚠️ No hay imágenes o eventos para cargar en el carrusel.');
    // Usar setTimeout para evitar el error NG0100
    setTimeout(() => {
      this.slides = [];
      this.cdr.detectChanges();
    }, 0);
    return;
  }

  console.log('📥 Datos recibidos en eventImages:', this.eventImages);

  // Usar setTimeout para evitar el error NG0100
  setTimeout(() => {
    // Si el primer elemento es un objeto con 'images' o 'bannerImage' → son eventos
    if (typeof this.eventImages[0] === 'object') {
      console.log('📦 Se detectó un array de eventos, procesando imágenes...');

      this.slides = (this.eventImages as IEvent[]).flatMap(event => {
        const slides: { imageUrl: string; title?: string }[] = [];

        if (event.bannerImage) {
          slides.push({
            imageUrl: event.bannerImage,
            title: event.name
          });
          console.log(`🖼️ Banner agregado: ${event.bannerImage}`);
        }

        // 👇 Ojo: tu modelo tiene "images" (plural), no "image"
        if (Array.isArray(event.images) && event.images.length > 0) {
          event.images.forEach(img => {
            slides.push({
              imageUrl: img,
              title: event.name
            });
            console.log(`🖼️ Imagen agregada: ${img}`);
          });
        }

        return slides;
      });

    } else {
      console.log('🧩 Se detectó un array de URLs simples.');
      this.slides = (this.eventImages as string[]).map(img => ({
        imageUrl: img
      }));
    }

    console.log('✅ Imágenes cargadas en slides:', this.slides);
    
    // Reiniciar el índice si es necesario
    if (this.currentIndex >= this.slides.length) {
      this.currentIndex = 0;
    }
    
    // Forzar detección de cambios después de cargar las imágenes
    this.cdr.detectChanges();
  }, 0);
}



}
