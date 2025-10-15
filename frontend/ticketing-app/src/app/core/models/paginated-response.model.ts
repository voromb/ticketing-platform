// src/app/shared/models/paginated-response.model.ts

/**
 * Interface for a generic paginated API response.
 * @template T - The type of data array contained in the response.
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}