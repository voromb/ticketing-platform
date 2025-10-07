import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { debounceTime, switchMap, Observable, of } from 'rxjs';
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

  constructor(private searchService: SearchService) {}

  ngOnInit(): void {
    this.suggestions$ = this.searchControl.valueChanges.pipe(
      debounceTime(300),
      switchMap(value => value ? this.searchService.getSuggestions(value) : of([]))
    );
  }

  onSearch(query: string | null) {
    const q = query || '';
    console.log('Buscar:', q);
    // Aquí podrías redirigir a una página de resultados
  }

  selectSuggestion(suggestion: string) {
    this.searchControl.setValue(suggestion);
    this.onSearch(suggestion);
  }
}
