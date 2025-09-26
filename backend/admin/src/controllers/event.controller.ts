import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient, EventStatus } from '@prisma/client';

const prisma = new PrismaClient();

enum MusicGenre {
    HEAVY_METAL = 'HEAVY_METAL',
    THRASH_METAL = 'THRASH_METAL',
    DEATH_METAL = 'DEATH_METAL',
    HARD_ROCK = 'HARD_ROCK',
    PUNK_ROCK = 'PUNK_ROCK'
}

enum EventFormat {
    FESTIVAL = 'FESTIVAL',
    CONCERT = 'CONCERT',
    TRIBUTE = 'TRIBUTE'
}

interface CreateSimpleEventBody {
    name: string;
    slug: string;
    eventDate: string;
    saleStartDate: string;
    saleEndDate: string;
    venueId: string;
    totalCapacity: number;
    genre: MusicGenre;
    format: EventFormat;
    headliner: string;
    hasMoshpit: boolean;
    hasVipMeetAndGreet: boolean;
    merchandiseAvailable: boolean;
    minPrice: number;
    maxPrice: number;
    description?: string;
    ageRestriction?: string;
}

class SimpleEventController {
    async createRockEvent(
        request: FastifyRequest<{ Body: CreateSimpleEventBody }>,
        reply: FastifyReply
    ) {
        try {
            const { user } = request;
            const eventData = request.body;

            if (!user || !user.id) {
                return reply.code(403).send({
                    error: 'Usuario no autenticado'
                });
            }

            const venue = await prisma.venue.findUnique({
                where: { id: eventData.venueId }
            });

            if (!venue) {
                return reply.code(404).send({
                    error: 'El venue especificado no existe'
                });
            }
            if (eventData.totalCapacity > venue.capacity) {
                return reply.code(400).send({
                    error: `La capacidad total (${eventData.totalCapacity}) no puede exceder la capacidad del venue (${venue.capacity})`
                });
            }

            const existingEvent = await prisma.event.findUnique({
                where: { slug: eventData.slug }
            });

            if (existingEvent) {
                return reply.code(400).send({
                    error: 'Ya existe un evento con este slug'
                });
            }

            const event = await prisma.event.create({
                data: {
                    name: eventData.name,
                    description: eventData.description || `${eventData.format} de ${eventData.genre} con ${eventData.headliner}`,
                    slug: eventData.slug,
                    status: EventStatus.DRAFT,
                    eventDate: new Date(eventData.eventDate),
                    saleStartDate: new Date(eventData.saleStartDate),
                    saleEndDate: new Date(eventData.saleEndDate),
                    venueId: eventData.venueId,
                    totalCapacity: eventData.totalCapacity,
                    availableTickets: eventData.totalCapacity,
                    category: 'ROCK_METAL_CONCERT',
                    subcategory: `${eventData.genre}|${eventData.format}`,
                    tags: [eventData.genre.toLowerCase(), eventData.format.toLowerCase(), eventData.headliner.toLowerCase()],
                    minPrice: eventData.minPrice,
                    maxPrice: eventData.maxPrice,
                    ageRestriction: eventData.ageRestriction || '+16',
                    createdById: user.id
                },
                include: {
                    venue: true
                }
            });

            return reply.code(201).send({
                success: true,
                data: event,
                message: `🤘 Evento de ${eventData.genre.replace('_', ' ').toLowerCase()} creado exitosamente!`
            });

        } catch (error) {
            console.error('Error creating rock/metal event:', error);
            return reply.code(500).send({
                error: 'Error al crear el evento de rock/metal'
            });
        }
    }

    async listRockEvents(request: FastifyRequest, reply: FastifyReply) {
        try {
            const events = await prisma.event.findMany({
                where: { category: 'ROCK_METAL_CONCERT' },
                include: {
                    venue: {
                        select: { id: true, name: true, city: true }
                    }
                },
                orderBy: { eventDate: 'asc' }
            });

            return reply.send({
                success: true,
                data: events
            });
        } catch (error) {
            console.error('Error listing events:', error);
            return reply.code(500).send({
                error: 'Error al listar eventos'
            });
        }
    }

    async getRockEventById(
        request: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ) {
        try {
            const { id } = request.params;

            const event = await prisma.event.findUnique({
                where: { id },
                include: {
                    venue: true,
                    priceCategories: true
                }
            });

            if (!event) {
                return reply.code(404).send({
                    error: 'Evento no encontrado'
                });
            }

            return reply.send({
                success: true,
                data: event
            });
        } catch (error) {
            console.error('Error getting event:', error);
            return reply.code(500).send({
                error: 'Error al obtener el evento'
            });
        }
    }

    async getRockEventStats(request: FastifyRequest, reply: FastifyReply) {
        try {
            const events = await prisma.event.findMany({
                where: { category: 'ROCK_METAL_CONCERT' }
            });

            return reply.send({
                success: true,
                data: {
                    totalEvents: events.length,
                    totalCapacity: events.reduce((sum, e) => sum + e.totalCapacity, 0)
                }
            });
        } catch (error) {
            console.error('Error getting stats:', error);
            return reply.code(500).send({
                error: 'Error al obtener estadísticas'
            });
        }
    }
}

export default new SimpleEventController();
