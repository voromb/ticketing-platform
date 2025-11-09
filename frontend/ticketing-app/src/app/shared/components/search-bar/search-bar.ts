import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { debounceTime, switchMap, Observable, of, tap } from 'rxjs';
import { SearchService } from '~/app/core/services/search.service';

@Component({
  standalone: true,
  selector: 'app-search-bar',
  templateUrl: './search-bar.html',
  styleUrls: ['./search-bar.css'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class SearchBarComponent implements OnInit {
  searchControl = new FormControl('');
  suggestions$: Observable<string[]> = of([]);
  showSuggestions = false;

  constructor(
    private searchService: SearchService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('🎬 SearchBarComponent inicializado');
    
    // Sugerencias automáticas mientras escribe (solo si hay 3+ caracteres)
    this.suggestions$ = this.searchControl.valueChanges.pipe(
      debounceTime(300),
      switchMap(value => {
        if (value && value.length >= 3) {
          return this.searchService.getSuggestions(value).pipe(
            tap(() => {
              setTimeout(() => {
                this.showSuggestions = true;
                this.cdr.detectChanges();
              });
            })
          );
        } else {
          setTimeout(() => {
            this.showSuggestions = false;
            this.cdr.detectChanges();
          });
          return of([]);
        }
      })
    );
  }

  /**
   * Buscar usando IA NLP y redirigir a página de resultados
   */
  onSearch(query: string | null) {
    console.log('🎯 onSearch ejecutado!', query);
    
    const q = query || '';
    
    if (!q.trim()) {
      console.log('⚠️ Query vacío');
      return;
    }

    console.log('🔍 Redirigiendo a resultados con query:', q);

    // Redirigir a página de resultados
    this.router.navigate(['/search'], {
      queryParams: { q: q }
    });
  }

  /**
   * Seleccionar una sugerencia
   */
  selectSuggestion(suggestion: string) {
    this.showSuggestions = false;
    this.searchControl.setValue(suggestion);
    this.onSearch(suggestion);
  }

  /**
   * Ocultar sugerencias al hacer blur
   */
  hideSuggestions() {
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }
}
