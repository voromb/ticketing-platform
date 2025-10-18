"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const logger_1 = require("../utils/logger");
const social_service_1 = __importDefault(require("../services/social.service"));
const prisma = new client_1.PrismaClient();
class EventController {
    // ==================== CREAR EVENTO ====================
    async createEvent(request, reply) {
        try {
            const user = request.user;
            const data = request.body;
            if (!user?.id)
                return reply.code(403).send({ error: 'Usuario no autenticado' });
            // Validaciones de venue
            const venue = await prisma.venue.findUnique({ where: { id: data.venueId } });
            if (!venue)
                return reply.code(404).send({ error: 'Venue no encontrado' });
            if (data.totalCapacity > venue.capacity) {
                return reply.code(400).send({
                    error: `Capacidad total (${data.totalCapacity}) excede la del venue (${venue.capacity})`,
                });
            }
            // Validar slug
            const existingEvent = await prisma.event.findUnique({ where: { slug: data.slug } });
            if (existingEvent)
                return reply.code(400).send({ error: 'Slug ya existe' });
            // Validar categoría y subcategoría
            const category = await prisma.eventCategory.findUnique({
                where: { id: data.categoryId },
            });
            if (!category)
                return reply.code(400).send({ error: 'Categoría no encontrada' });
            const subcategory = await prisma.eventSubcategory.findUnique({
                where: { id: data.subcategoryId },
            });
            if (!subcategory)
                return reply.code(400).send({ error: 'Subcategoría no encontrada' });
            // Crear evento
            const event = await prisma.event.create({
                data: {
                    name: data.name,
                    description: data.description || `${category.name} - ${subcategory.name}`,
                    slug: data.slug,
                    status: client_1.EventStatus.DRAFT,
                    eventDate: new Date(data.eventDate),
                    saleStartDate: new Date(data.saleStartDate),
                    saleEndDate: new Date(data.saleEndDate),
                    venueId: data.venueId,
                    totalCapacity: data.totalCapacity,
                    availableTickets: data.totalCapacity,
                    categoryId: category.id,
                    subcategoryId: subcategory.id,
                    tags: [category.name.toLowerCase(), subcategory.name.toLowerCase()],
                    minPrice: data.minPrice,
                    maxPrice: data.maxPrice,
                    ageRestriction: data.ageRestriction || '+16',
                    createdById: user.id,
                },
                include: { venue: true, category: true, subcategory: true },
            });
            return reply.code(201).send({
                success: true,
                data: event,
                message: `Evento ${category.name} - ${subcategory.name} creado exitosamente!`,
            });
        }
        catch (error) {
            logger_1.logger.error('Error creating event:', error);
            return reply
                .status(500)
                .send({ success: false, error: error.message || 'Error interno' });
        }
    }
    // Métodos públicos (sin autenticación)
    async listRockEvents(request, reply) {
        try {
            const events = await prisma.event.findMany({
                include: {
                    venue: {
                        select: {
                            id: true,
                            name: true,
                            city: true,
                            capacity: true,
                            address: true,
                        },
                    },
                    localities: {
                        select: {
                            id: true,
                            name: true,
                            capacity: true,
                            availableTickets: true,
                            soldTickets: true,
                            reservedTickets: true,
                            price: true,
                            color: true,
                            isActive: true,
                        },
                        where: {
                            isActive: true,
                        },
                        orderBy: {
                            sortOrder: 'asc',
                        },
                    },
                },
                orderBy: {
                    eventDate: 'asc',
                },
            });
            return reply.send({ success: true, data: events, total: events.length });
        }
        catch (error) {
            logger_1.logger.error('Error listing events:', error);
            return reply.status(500).send({ success: false, error: 'Error interno del servidor' });
        }
    }
    // Opcional: solo categorías que tienen al menos un evento activo
    async listAvailableCategories(req, reply) {
        try {
            const categories = await prisma.eventCategory.findMany({
                where: {
                    Event: {
                        some: { status: 'ACTIVE' },
                    },
                },
                include: {
                    EventSubcategory: {
                        where: { Event: { some: { status: 'ACTIVE' } } },
                    },
                },
            });
            return reply.send(categories);
        }
        catch (error) {
            console.error(error);
            return reply.status(500).send({ message: 'Error fetching available categories' });
        }
    }
    // ==================== LISTAR EVENTOS ====================
    async listRockEvents(request, reply) {
        try {
            const { venueId, categoryId, subcategoryId, minPrice, maxPrice, query, page = 1, limit = 1000, } = request.query;
            const pageNumber = Number(page) || 1;
            const pageSize = Number(limit) || 1000;
            const where = {};
            if (venueId && venueId !== 'null' && venueId !== '')
                where.venueId = Number(venueId);
            if (categoryId && categoryId !== 'null' && categoryId !== '')
                where.categoryId = Number(categoryId);
            if (subcategoryId && subcategoryId !== 'null' && subcategoryId !== '')
                where.subcategoryId = Number(subcategoryId);
            const priceFilters = [];
            if (minPrice && !isNaN(Number(minPrice))) {
                priceFilters.push({ minPrice: { gte: Number(minPrice) } });
            }
            if (maxPrice && !isNaN(Number(maxPrice))) {
                priceFilters.push({ maxPrice: { lte: Number(maxPrice) } });
            }
            if (priceFilters.length > 0)
                where.AND = priceFilters;
            if (query && typeof query === 'string' && query.trim() !== '') {
                where.name = { contains: query, mode: 'insensitive' };
            }
            const totalEvents = await prisma.event.count({ where });
            const events = await prisma.event.findMany({
                where,
                include: {
                    venue: true,
                    category: true,
                    subcategory: true,
                },
                orderBy: { eventDate: 'asc' },
                skip: (pageNumber - 1) * pageSize,
                take: pageSize,
            });
            return reply.send({
                success: true,
                data: events,
                total: totalEvents,
                page: pageNumber,
                totalPages: Math.ceil(totalEvents / pageSize),
            });
        }
        catch (error) {
            console.error('❌ Error listing events:', error);
            return reply.status(500).send({
                success: false,
                error: 'Error interno al listar eventos',
            });
        }
    }
    // ==================== GET EVENTO POR ID ====================
    async getEventById(request, reply) {
        try {
            const { id } = request.params;
            const user = request.user;
            // 🔍 Si parece un UUID válido (por ejemplo, 'f47ac10b-58cc-4372-a567-0e02b2c3d479')
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
            let event;
            if (isUUID) {
                // 🟢 Buscar por ID
                event = await prisma.event.findUnique({
                    where: { id },
                    include: { venue: true, category: true, subcategory: true },
                });
            }
            else {
                // 🟠 Buscar por slug
                event = await prisma.event.findUnique({
                    where: { slug: id },
                    include: { venue: true, category: true, subcategory: true },
                });
            }
            if (!event)
                return reply.status(404).send({ success: false, error: 'Evento no encontrado' });
            // Obtener estadísticas sociales
            const socialStats = await social_service_1.default.getEventSocialStats(event.id, user?.id);
            return reply.send({
                success: true,
                data: {
                    ...event,
                    socialStats
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Error getting event by ID or slug:', error);
            return reply.status(500).send({ success: false, error: 'Error interno' });
        }
    }
    // ===================== GET EVENTS BY VENUE SLUG =================///
    // ==================== GET EVENTS BY VENUE SLUG ====================
    async getEventsByVenueSlugPaginated(request, reply) {
        try {
            const { venueSlug } = request.params; // 🔹 usar params
            const { page = 1, limit = 10 } = request.query;
            if (!venueSlug) {
                return reply.status(400).send({ success: false, error: 'Venue slug es requerido' });
            }
            const pageNumber = Number(page) || 1;
            const pageSize = Number(limit) || 10;
            // Contar total de eventos
            const totalEvents = await prisma.event.count({
                where: {
                    venue: { slug: venueSlug },
                },
            });
            // Obtener eventos paginados
            const events = await prisma.event.findMany({
                where: {
                    venue: { slug: venueSlug },
                },
                include: {
                    venue: true,
                    category: true,
                    subcategory: true,
                    priceCategories: true,
                },
                orderBy: { eventDate: 'asc' },
                skip: (pageNumber - 1) * pageSize,
                take: pageSize,
            });
            return reply.send({
                success: true,
                data: events,
                total: totalEvents,
                page: pageNumber,
                totalPages: Math.ceil(totalEvents / pageSize),
            });
        }
        catch (error) {
            logger_1.logger.error('Error fetching paginated events by venue slug:', error);
            return reply.status(500).send({ success: false, error: 'Error interno del servidor' });
        }
    }
    // ==================== ACTUALIZAR EVENTO ====================
    async updateEvent(request, reply) {
        try {
            const { id } = request.params;
            const updateData = request.body;
            console.log('📥 UPDATE - Datos recibidos:', JSON.stringify(updateData, null, 2));
            console.log('🆔 UPDATE - ID evento:', id);
            const existingEvent = await prisma.event.findUnique({ where: { id } });
            if (!existingEvent)
                return reply.status(404).send({ success: false, error: 'Evento no encontrado' });
            if (updateData.slug && updateData.slug !== existingEvent.slug) {
                const slugExists = await prisma.event.findUnique({
                    where: { slug: updateData.slug },
                });
                if (slugExists)
                    return reply.status(400).send({ success: false, error: 'Slug ya existe' });
            }
            if (updateData.categoryId) {
                const cat = await prisma.eventCategory.findUnique({
                    where: { id: updateData.categoryId },
                });
                if (!cat)
                    return reply.status(400).send({ error: 'Categoría inválida' });
            }
            if (updateData.subcategoryId) {
                const sub = await prisma.eventSubcategory.findUnique({
                    where: { id: updateData.subcategoryId },
                });
                if (!sub)
                    return reply.status(400).send({ error: 'Subcategoría inválida' });
            }
            if (updateData.eventDate)
                updateData.eventDate = new Date(updateData.eventDate);
            if (updateData.saleStartDate)
                updateData.saleStartDate = new Date(updateData.saleStartDate);
            if (updateData.saleEndDate)
                updateData.saleEndDate = new Date(updateData.saleEndDate);
            const { venueId, categoryId, subcategoryId, genre, format, headliner, hasMoshpit, hasVipMeetAndGreet, merchandiseAvailable, isPublished, ...validData } = updateData;
            const updatedEvent = await prisma.event.update({
                where: { id },
                data: { ...validData, updatedAt: new Date() },
                include: { venue: true, category: true, subcategory: true },
            });
            return reply.send({
                success: true,
                data: updatedEvent,
                message: 'Evento actualizado exitosamente',
            });
        }
        catch (error) {
            console.error('❌ ERROR COMPLETO AL ACTUALIZAR:', error);
            console.error('📋 Mensaje:', error.message);
            console.error('📋 Stack:', error.stack);
            logger_1.logger.error('Error updating event:', error);
            return reply.status(500).send({ success: false, error: 'Error interno' });
        }
    }
    // ==================== ELIMINAR EVENTO ====================
    async deleteEvent(request, reply) {
        try {
            const { id } = request.params;
            const existingEvent = await prisma.event.findUnique({ where: { id } });
            if (!existingEvent)
                return reply.status(404).send({ success: false, error: 'Evento no encontrado' });
            await prisma.event.delete({ where: { id } });
            return reply.send({ success: true, message: 'Evento eliminado exitosamente' });
        }
        catch (error) {
            logger_1.logger.error('Error deleting event:', error);
            return reply.status(500).send({ success: false, error: 'Error interno' });
        }
    }
    // ==================== OBTENER LOCALIDADES DE UN EVENTO ====================
    async getEventLocalities(request, reply) {
        try {
            const { id } = request.params;
            const event = await prisma.event.findUnique({ where: { id } });
            if (!event) {
                return reply.status(404).send({ success: false, error: 'Evento no encontrado' });
            }
            const localities = await prisma.eventLocality.findMany({
                where: {
                    eventId: id,
                    isActive: true,
                },
                orderBy: {
                    price: 'asc',
                },
            });
            logger_1.logger.info(`📍 Localidades encontradas para evento ${id}: ${localities.length}`);
            return reply.send({
                success: true,
                data: localities,
                total: localities.length,
            });
        }
        catch (error) {
            logger_1.logger.error('Error getting event localities:', error);
            return reply
                .status(500)
                .send({ success: false, error: 'Error interno', details: error.message });
        }
    }
}
exports.default = new EventController();
