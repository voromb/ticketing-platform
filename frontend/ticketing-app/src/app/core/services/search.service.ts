import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { AiService, SearchParams } from './ai.service';
import { EventService } from './event.service';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  // Sugerencias predefinidas para búsqueda rápida
  private quickSuggestions = [
    'thrash metal en Valencia',
    'death metal',
    'conciertos baratos',
    'eventos este mes',
    'doom metal en Madrid',
    'power metal',
    'black metal',
    'eventos en Barcelona',
    'indie rock',
    'punk rock'
  ];

  constructor(
    private http: HttpClient,
    private aiService: AiService,
    private eventService: EventService
  ) {}

  /**
   * Obtener sugerencias basadas en el query
   */
  getSuggestions(query: string): Observable<string[]> {
    if (!query || query.length < 2) {
      return of([]);
    }

    // Filtrar sugerencias que coincidan con el query
    const filtered = this.quickSuggestions.filter(s => 
      s.toLowerCase().includes(query.toLowerCase())
    );
    
    return of(filtered.slice(0, 5)); // Máximo 5 sugerencias
  }

  /**
   * Búsqueda con IA: IA extrae parámetros → BD busca TODOS los eventos
   */
  searchWithAI(query: string): Observable<any> {
    console.log('🔍 Búsqueda con IA:', query);
    
    // 1. Extraer parámetros con IA
    return this.aiService.extractSearchParams(query).pipe(
      switchMap(params => {
        console.log('📊 Parámetros extraídos por IA:', params);
        
        // 2. Construir query para búsqueda en BD
        let searchQuery = '';
        
        if (params.genre && params.city) {
          // Si hay género Y ciudad, buscar por género (más específico)
          const genreWords = params.genre.split(' ');
          searchQuery = genreWords[0]; // "thrash"
        } else if (params.genre) {
          // Solo género
          const genreWords = params.genre.split(' ');
          searchQuery = genreWords[0];
        } else if (params.city) {
          // Solo ciudad
          searchQuery = params.city;
        } else {
          searchQuery = query;
        }
        
        console.log('🔎 Buscando en BD con:', searchQuery);
        console.log('🏙️ Filtrar por ciudad:', params.city || 'No');
        
        // 3. Buscar TODOS los eventos en la BD
        return this.eventService.getEventsFiltered({ query: searchQuery }).pipe(
          map(response => {
            console.log('✅ Eventos encontrados en BD:', response.data.length);
            return {
              query: query,
              params: params,
              searchQuery: searchQuery,
              events: response.data,
              success: response.success,
              total: response.total
            };
          })
        );
      }),
      catchError(error => {
        console.error('❌ Error en búsqueda:', error);
        return of({
          query: query,
          params: null,
          searchQuery: '',
          events: [],
          success: false,
          total: 0,
          error: error.message
        });
      })
    );
  }

  /**
   * Extraer nombres de eventos de la respuesta de IA
   */
  private extractEventNames(text: string): string[] {
    if (text.includes('NO_ENCONTRADO')) {
      return [];
    }

    const names: string[] = [];
    const lines = text.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Ignorar líneas vacías o muy cortas
      if (trimmed.length < 5) continue;
      
      // Ignorar líneas que son explicaciones
      if (trimmed.toLowerCase().includes('encontré') || 
          trimmed.toLowerCase().includes('búsqueda') ||
          trimmed.toLowerCase().includes('memoria')) {
        continue;
      }
      
      // Extraer nombre limpio
      let name = trimmed;
      
      // Quitar números y guiones del inicio
      name = name.replace(/^\d+[\.\)]\s*/, '');
      name = name.replace(/^[-*]\s*/, '');
      name = name.replace(/^\*\*/, '').replace(/\*\*$/, '');
      
      // Quitar dos puntos y lo que sigue
      if (name.includes(':')) {
        name = name.split(':')[0];
      }
      
      name = name.trim();
      
      // Agregar si tiene longitud razonable
      if (name.length > 5 && name.length < 100) {
        names.push(name);
      }
    }

    return names;
  }

  /**
   * Parsear eventos desde respuesta de texto de IA
   */
  private parseEventsFromAI(text: string): any[] {
    if (text.includes('NO_ENCONTRADO')) {
      return [];
    }

    const events: any[] = [];
    
    // Buscar patrones de eventos en el texto
    const lines = text.split('\n');
    let currentEvent: any = null;

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Detectar inicio de evento (número, guión, asterisco o **nombre**)
      if (/^\d+\.|^-|^\*\*|^\*/.test(trimmed) && trimmed.length > 3) {
        // Guardar evento anterior si existe
        if (currentEvent && currentEvent.name) {
          events.push(currentEvent);
        }
        
        // Crear nuevo evento
        currentEvent = { 
          id: `ai-${Date.now()}-${Math.random()}`,
          venue: {},
          minPrice: '0',
          maxPrice: '0'
        };
        
        // Extraer nombre (después del número/guión/asterisco hasta : o fin de línea)
        let nameMatch = trimmed.match(/^[\d\.\-\*\s]+(.+?)(?:\:|$)/);
        if (!nameMatch) {
          // Intentar sin prefijo
          nameMatch = trimmed.match(/^(.+?)(?:\:|$)/);
        }
        if (nameMatch) {
          currentEvent.name = nameMatch[1].replace(/\*\*/g, '').trim();
        }
      }
      
      // Si hay evento actual, buscar sus datos
      if (currentEvent) {
        // Buscar ciudad (más flexible)
        if (trimmed.toLowerCase().includes('ciudad') || 
            trimmed.toLowerCase().includes('lugar') ||
            trimmed.toLowerCase().includes('valencia') ||
            trimmed.toLowerCase().includes('madrid') ||
            trimmed.toLowerCase().includes('barcelona')) {
          
          const cityMatch = trimmed.match(/(?:ciudad|lugar):\s*(.+?)(?:\n|$)/i);
          if (cityMatch) {
            currentEvent.venue.city = cityMatch[1].trim();
          } else {
            // Buscar ciudades conocidas
            const cities = ['Valencia', 'Madrid', 'Barcelona', 'Sevilla', 'Bilbao', 'Málaga', 'Pamplona', 'Córdoba'];
            for (const city of cities) {
              if (trimmed.includes(city)) {
                currentEvent.venue.city = city;
                break;
              }
            }
          }
        }
        
        // Buscar precio (más flexible)
        if (trimmed.toLowerCase().includes('precio') || /\d+€/.test(trimmed)) {
          const priceMatch = trimmed.match(/(\d+).*?(\d+)/);
          if (priceMatch) {
            currentEvent.minPrice = priceMatch[1];
            currentEvent.maxPrice = priceMatch[2];
          } else {
            // Buscar precio simple
            const singlePrice = trimmed.match(/(\d+)€/);
            if (singlePrice) {
              currentEvent.minPrice = singlePrice[1];
              currentEvent.maxPrice = singlePrice[1];
            }
          }
        }
        
        // Descripción (líneas que no son campos específicos y tienen longitud razonable)
        if (!trimmed.match(/^(ciudad|lugar|precio|fecha)/i) && 
            trimmed.length > 20 && 
            trimmed.length < 200 &&
            !trimmed.match(/^\d+\.|^-|^\*/)) {
          if (!currentEvent.description) {
            currentEvent.description = trimmed.substring(0, 150);
          }
        }
      }
    }
    
    // Agregar último evento
    if (currentEvent && currentEvent.name) {
      events.push(currentEvent);
    }

    console.log('🎯 Eventos parseados:', events);
    return events;
  }

  /**
   * Parsear respuesta de IA para extraer eventos
   */
  private parseAIResponse(response: string): any[] {
    if (response.includes('NO_RESULTS')) {
      return [];
    }

    const events: any[] = [];
    const eventBlocks = response.split('---').filter(block => block.trim());

    for (const block of eventBlocks) {
      const lines = block.split('\n').filter(line => line.trim());
      const event: any = {};

      for (const line of lines) {
        if (line.includes('EVENTO:')) {
          event.name = line.split('EVENTO:')[1].trim();
        } else if (line.includes('DESCRIPCION:')) {
          event.description = line.split('DESCRIPCION:')[1].trim();
        } else if (line.includes('CIUDAD:')) {
          event.venue = { city: line.split('CIUDAD:')[1].trim() };
        } else if (line.includes('PRECIO:')) {
          const priceText = line.split('PRECIO:')[1].trim();
          const prices = priceText.match(/(\d+)€\s*-\s*(\d+)€/);
          if (prices) {
            event.minPrice = prices[1];
            event.maxPrice = prices[2];
          }
        }
      }

      if (event.name) {
        event.id = `ai-${Date.now()}-${Math.random()}`;
        event.slug = event.name.toLowerCase().replace(/\s+/g, '-');
        events.push(event);
      }
    }

    return events;
  }

  /**
   * Obtener chat response de la IA
   */
  chatWithAI(message: string): Observable<string> {
    return this.aiService.chat(message);
  }
}
