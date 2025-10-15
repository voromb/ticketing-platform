
/**
 * Interface for the filtering and pagination parameters for fetching events.
 */
export interface EventsFilterParams {
  categoryId?: number | string | null;
  subcategoryId?: number | string | null;
  venueId?: string;
  query?: string;
  minPrice?: number | string | null;
  maxPrice?: number | string | null;
  page?: number;
  limit?: number;
}

/**
 * Interface for parameters when fetching events by venue slug.
 */
export interface VenueSlugParams {
  venueSlug: string;
  page?: number;
  limit?: number;
}