// src/app/models/event.model.ts

export interface IEvent {
  id?: string;           // opcional, por si lo recibes del backend
  name: string;
  description?: string;
  slug: string;
  eventDate: string;      // puedes usar Date si quieres convertirlo en frontend
  saleStartDate: string;
  saleEndDate: string;
  venueId: string;
  totalCapacity: number;
  category: string;
  minPrice: number;
  maxPrice: number;
}

// Para queries de paginación y búsqueda
export interface EventQuery {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}
