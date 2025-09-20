export interface IVenue {
  name: string;
  address: string;
  city: string;
  capacity: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface IEvent {
  id: string;
  name: string;
  description: string;
  date: Date;
  venue: IVenue;
  category: EventCategory;
  totalCapacity: number;
  availableSeats: number;
  basePrice: number;
  imageUrl?: string;
  status: EventStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  SOLD_OUT = 'sold_out',
  CANCELLED = 'cancelled'
}

export enum EventCategory {
  CONCERT = 'concert',
  THEATER = 'theater',
  SPORTS = 'sports',
  CONFERENCE = 'conference',
  FESTIVAL = 'festival',
  OTHER = 'other'
}