import { Routes } from '@angular/router';

export const SEARCH_RESULTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./search-results').then((m) => m.SearchResultsComponent),
  },
];
