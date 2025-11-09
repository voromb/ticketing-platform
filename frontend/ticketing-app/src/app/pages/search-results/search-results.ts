import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SearchService } from '~/app/core/services/search.service';
import { AiService } from '~/app/core/services/ai.service';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './search-results.html',
  styleUrls: ['./search-results.css']
})
export class SearchResultsComponent implements OnInit {
  searchQuery: string = '';
  aiParams: any = null;
  filters: any = {};
  loading: boolean = true;
  eventsCount: number = 0;
  aiMessage: string = '';
  generatingMessage: boolean = false;
  searchResults: any = null;

  constructor(
    private route: ActivatedRoute,
    private searchService: SearchService,
    private aiService: AiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Leer query params
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['q'] || '';
      
      if (this.searchQuery) {
        console.log('🔍 Búsqueda recibida:', this.searchQuery);
        this.performSearch();
      } else {
        this.loading = false;
      }
    });
  }

  performSearch(): void {
    this.loading = true;
    
    this.searchService.searchWithAI(this.searchQuery).subscribe({
      next: (result) => {
        console.log('✅ Resultados de búsqueda:', result);
        
        // Filtrar por ciudad si la IA detectó una
        let filteredEvents = result.events || [];
        if (result.params?.city) {
          console.log('🏙️ Filtrando por ciudad:', result.params.city);
          filteredEvents = filteredEvents.filter((event: any) => 
            event.venue?.city?.toLowerCase().includes(result.params.city.toLowerCase())
          );
          console.log('✅ Eventos después de filtrar por ciudad:', filteredEvents.length);
        }
        
        this.searchResults = { ...result, events: filteredEvents };
        this.aiParams = result.params;
        this.eventsCount = filteredEvents.length;
        
        // Configurar filtros para el componente de eventos
        this.filters = {
          query: result.searchQuery
        };
        
        this.loading = false;
        
        // Generar mensaje de IA con contexto de los eventos encontrados
        this.generateAIMessage();
        
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Error en búsqueda:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  generateAIMessage(): void {
    this.generatingMessage = true;
    
    let prompt = '';
    
    if (this.eventsCount === 0) {
      // Sin resultados
      prompt = `El usuario buscó "${this.searchQuery}" pero no encontramos eventos. 
      Genera un mensaje amigable y personalizado explicando que lamentablemente no hay eventos de ${this.aiParams?.genre || 'ese tipo'} ${this.aiParams?.city ? 'en ' + this.aiParams.city : ''} en este momento.
      Sé empático, usa un tono metalero/rockero y sugiere que pruebe con otras búsquedas o que vuelva pronto.
      Máximo 2-3 frases cortas.`;
    } else {
      // Con resultados - incluir contexto de eventos reales
      const eventNames = this.searchResults?.events?.slice(0, 3).map((e: any) => e.name).join(', ') || '';
      const cities = [...new Set(this.searchResults?.events?.slice(0, 5).map((e: any) => e.venue?.city).filter(Boolean))].join(', ') || '';
      
      prompt = `El usuario buscó "${this.searchQuery}" y encontramos ${this.eventsCount} eventos de ${this.aiParams?.genre || 'ese tipo'} ${this.aiParams?.city ? 'en ' + this.aiParams.city : ''}.
      
      Algunos eventos encontrados: ${eventNames}
      Ciudades disponibles: ${cities}
      
      Genera un mensaje corto y entusiasta dándole la bienvenida a los resultados. Menciona alguno de los eventos o ciudades si es relevante. Usa un tono metalero/rockero y anímalo a explorar.
      Máximo 2-3 frases cortas.`;
    }
    
    this.aiService.chat(prompt).subscribe({
      next: (message) => {
        this.aiMessage = message;
        this.generatingMessage = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Error generando mensaje:', error);
        if (this.eventsCount === 0) {
          this.aiMessage = `Lo sentimos, no encontramos eventos de ${this.aiParams?.genre || 'ese tipo'} ${this.aiParams?.city ? 'en ' + this.aiParams.city : ''} en este momento. ¡Vuelve pronto para ver nuevos eventos! 🤘`;
        } else {
          this.aiMessage = `¡Encontramos ${this.eventsCount} eventos increíbles para ti! Explora los resultados y prepárate para una noche épica. 🤘`;
        }
        this.generatingMessage = false;
        this.cdr.detectChanges();
      }
    });
  }
}
