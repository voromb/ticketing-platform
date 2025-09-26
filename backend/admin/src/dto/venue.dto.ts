import { z } from 'zod';

export const createVenueSchema = z.object({
  name: z.string().min(3).max(255),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  capacity: z.number().int().positive(),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().optional(),
  country: z.string().default('España'),
  postalCode: z.string(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  description: z.string().optional(),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  isActive: z.boolean().default(true)
});

export const updateVenueSchema = createVenueSchema.partial();

export const venueQuerySchema = z.object({
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('10').transform(Number),
  search: z.string().optional(),
  city: z.string().optional(),
  isActive: z.string().optional().transform(val => val === 'true')
});

export type CreateVenueDTO = z.infer<typeof createVenueSchema>;
export type UpdateVenueDTO = z.infer<typeof updateVenueSchema>;
export type VenueQueryDTO = z.infer<typeof venueQuerySchema>;
