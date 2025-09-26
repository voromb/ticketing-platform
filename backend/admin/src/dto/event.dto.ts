import { z } from 'zod';

export const createEventSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  slug: z.string(),
  eventDate: z.string(),
  saleStartDate: z.string(),
  saleEndDate: z.string(),
  venueId: z.string(),
  totalCapacity: z.number(),
  category: z.string(),
  minPrice: z.number(),
  maxPrice: z.number()
});

export const updateEventSchema = createEventSchema.partial();
export const eventQuerySchema = z.object({
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('10').transform(Number),
  status: z.string().optional(),
  search: z.string().optional()
});

export type CreateEventDTO = z.infer<typeof createEventSchema>;
export type UpdateEventDTO = z.infer<typeof updateEventSchema>;
export type EventQueryDTO = z.infer<typeof eventQuerySchema>;
