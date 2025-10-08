// Definición de los parámetros que se pueden usar para filtrar eventos

export interface EventFilterParams {
  categoryId?: number | string;
  minPrice?: number;
  maxPrice?: number;
  query?: string;
  venueId?: string;
}
