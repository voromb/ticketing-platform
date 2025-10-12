// src/app/models/event.model.ts
import { Venue } from "./Venue.model";

export interface IEvent {
  id?: string;           // opcional, por si lo recibes del backend
  name: string;
  description?: string;
  bannerImage: string;
  slug: string;
  images:[];
  eventDate: string; 
  availableTickets: number;     // puedes usar Date si quieres convertirlo en frontend
  saleStartDate: string;
  saleEndDate: string;
  venueId: string;
  venue: Venue;
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
