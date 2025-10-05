"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventQuerySchema = exports.updateEventSchema = exports.createEventSchema = void 0;
const zod_1 = require("zod");
exports.createEventSchema = zod_1.z.object({
    name: zod_1.z.string().min(3),
    description: zod_1.z.string().optional(),
    slug: zod_1.z.string(),
    eventDate: zod_1.z.string(),
    saleStartDate: zod_1.z.string(),
    saleEndDate: zod_1.z.string(),
    venueId: zod_1.z.string(),
    totalCapacity: zod_1.z.number(),
    categoryId: zod_1.z.number(), // ← aquí
    subcategoryId: zod_1.z.number().optional(), // ← si puede ser nula
    minPrice: zod_1.z.number(),
    maxPrice: zod_1.z.number()
});
exports.updateEventSchema = exports.createEventSchema.partial();
exports.eventQuerySchema = zod_1.z.object({
    page: zod_1.z.string().optional().default('1').transform(Number),
    limit: zod_1.z.string().optional().default('10').transform(Number),
    status: zod_1.z.string().optional(),
    search: zod_1.z.string().optional(),
    categoryId: zod_1.z.string().optional().transform(Number),
    subcategoryId: zod_1.z.string().optional().transform(Number)
});
