export interface EventFilterParams {
  categoryId?: number | string | null;
  subcategoryId?: number | string | null;
  venueId?: string;
  query?: string;
  minPrice?: number | string | null;
  maxPrice?: number | string | null;
  page?: number;
  limit?: number;
}
