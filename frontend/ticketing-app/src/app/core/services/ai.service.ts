import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface SearchParams {
  genre: string | null;
  city: string | null;
  date: string | null;
  price_max: number | null;
}

export interface OllamaResponse {
  model: string;
  response: string;
  done: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  // URL a través del proxy de Angular (evita CORS)
  private ollamaUrl = '/api/ollama/generate';
  
  // Modelos
  private chatModel = 'metalhead-assistant-v4';
  private searchModel = 'search-nlp-v2';

  constructor(private http: HttpClient) {}

  /**
   * Chat conversacional con el asistente V4 (datos actualizados)
   */
  chat(message: string): Observable<string> {
    return this.http.post<OllamaResponse>(this.ollamaUrl, {
      model: this.chatModel,
      prompt: message,
      stream: false
    }).pipe(
      map(response => response.response),
      catchError(error => {
        console.error('Error en chat:', error);
        return of('Lo siento, no pude procesar tu consulta. Por favor, intenta de nuevo.');
      })
    );
  }

  /**
   * Búsqueda NLP - Convierte lenguaje natural a parámetros estructurados
   */
  extractSearchParams(query: string): Observable<SearchParams> {
    console.log('🤖 Llamando a IA con URL:', this.ollamaUrl);
    console.log('🤖 Modelo:', this.searchModel);
    console.log('🤖 Query:', query);
    
    const body = {
      model: this.searchModel,
      prompt: query,
      stream: false
    };
    
    console.log('🤖 Body:', body);
    
    return this.http.post<OllamaResponse>(this.ollamaUrl, body).pipe(
      map(response => {
        console.log('🤖 Respuesta IA:', response);
        try {
          // Limpiar respuesta (remover markdown si existe)
          let jsonStr = response.response
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();
          
          console.log('🤖 JSON limpio:', jsonStr);
          const params = JSON.parse(jsonStr) as SearchParams;
          console.log('🤖 Parámetros parseados:', params);
          return params;
        } catch (error) {
          console.error('❌ Error parseando JSON:', error, response.response);
          // Retornar búsqueda vacía si falla el parsing
          return {
            genre: null,
            city: null,
            date: null,
            price_max: null
          };
        }
      }),
      catchError(error => {
        console.error('❌ Error completo en IA:', error);
        console.error('❌ Status:', error.status);
        console.error('❌ Message:', error.message);
        console.error('❌ URL:', error.url);
        return of({
          genre: null,
          city: null,
          date: null,
          price_max: null
        });
      })
    );
  }

  /**
   * Chat con contexto de eventos (RAG)
   */
  chatWithContext(message: string, events: any[]): Observable<string> {
    // Crear contexto con eventos
    const context = events.map((e, i) => 
      `${i+1}. ${e.name}\n   ${e.description}\n   ${e.minPrice}€ - ${e.maxPrice}€`
    ).join('\n\n');

    const prompt = `${message}\n\nEVENTOS ENCONTRADOS:\n${context}`;

    return this.chat(prompt);
  }
}
