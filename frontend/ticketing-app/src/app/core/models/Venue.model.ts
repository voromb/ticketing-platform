export interface Venue {
  id: string;
  name: string;
  capacity: number;
  city: string;
  state: string;
  country: string;
  address: string;
  postalCode: string;

  description: string;
  amenities: string[];
  images: string[];
  isActive: boolean;

  latitude: number | null;
  longitude: number | null;

  sections: any[];
  slug: string;

  createdAt: string;
  updatedAt: string;
  createdById: string;
}
