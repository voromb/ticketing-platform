// Definición de los parámetros que se pueden usar para filtrar eventos

export interface EventFilterParams {
  categoryId?: number | string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  query?: string;
  venueId?: string;
}
