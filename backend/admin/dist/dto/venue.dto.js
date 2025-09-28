"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.venueQuerySchema = exports.updateVenueSchema = exports.createVenueSchema = void 0;
const zod_1 = require("zod");
exports.createVenueSchema = zod_1.z.object({
    name: zod_1.z.string().min(3).max(255),
    slug: zod_1.z.string().regex(/^[a-z0-9-]+$/),
    capacity: zod_1.z.number().int().positive(),
    address: zod_1.z.string().min(5),
    city: zod_1.z.string().min(2),
    state: zod_1.z.string().optional(),
    country: zod_1.z.string().default('España'),
    postalCode: zod_1.z.string(),
    latitude: zod_1.z.number().optional(),
    longitude: zod_1.z.number().optional(),
    description: zod_1.z.string().optional(),
    amenities: zod_1.z.array(zod_1.z.string()).default([]),
    images: zod_1.z.array(zod_1.z.string()).default([]),
    isActive: zod_1.z.boolean().default(true)
});
exports.updateVenueSchema = exports.createVenueSchema.partial();
exports.venueQuerySchema = zod_1.z.object({
    page: zod_1.z.string().optional().default('1').transform(Number),
    limit: zod_1.z.string().optional().default('10').transform(Number),
    search: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    isActive: zod_1.z.string().optional().transform(val => val === 'true')
});
