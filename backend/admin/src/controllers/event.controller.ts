import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient, EventStatus } from '@prisma/client';
import logger from '../utils/logger';

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

            // Validar campos requeridos
            const requiredFields = ['name', 'slug', 'eventDate', 'venueId', 'totalCapacity', 'genre', 'format', 'headliner'];
            const missingFields = requiredFields.filter(field => !eventData[field]);
            
            if (missingFields.length > 0) {
                return reply.code(400).send({
                    success: false,
                    error: `Campos requeridos faltantes: ${missingFields.join(', ')}`
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
                    tags: [
                        eventData.genre?.toLowerCase() || 'rock',
                        eventData.format?.toLowerCase() || 'concert', 
                        eventData.headliner?.toLowerCase() || 'unknown'
                    ],
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
            return reply.status(500).send({
                success: false,
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
                        select: {
                            id: true,
                            name: true,
                            city: true,
                            capacity: true
                        }
                    }
                },
                orderBy: { eventDate: 'asc' }
            });

            return reply.send({
                success: true,
                data: events
            });
        } catch (error) {
            console.error('Error listing rock events:', error);
            return reply.status(500).send({
                success: false,
                error: 'Error interno del servidor'
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
                    venue: {
                        select: {
                            id: true,
                            name: true,
                            city: true,
                            capacity: true,
                            address: true
                        }
                    }
                }
            });

            if (!event) {
                return reply.status(404).send({
                    success: false,
                    error: 'Evento no encontrado'
                });
            }

            return reply.send({
                success: true,
                data: event
            });
        } catch (error) {
            console.error('Error getting rock event by id:', error);
            return reply.status(500).send({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }

    async getRockEventStats(request: FastifyRequest, reply: FastifyReply) {
        try {
            const events = await prisma.event.findMany({
                where: { category: 'ROCK_METAL_CONCERT' }
            });

            const stats = {
                totalEvents: events.length,
                totalCapacity: events.reduce((sum, event) => sum + event.totalCapacity, 0),
                averageCapacity: events.length > 0 
                    ? Math.round(events.reduce((sum, event) => sum + event.totalCapacity, 0) / events.length)
                    : 0,
                upcomingEvents: events.filter(event => new Date(event.eventDate) > new Date()).length,
                pastEvents: events.filter(event => new Date(event.eventDate) <= new Date()).length
            };

            return reply.send({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Error getting rock event stats:', error);
            return reply.status(500).send({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }

    async updateRockEvent(
        request: FastifyRequest<{ 
            Params: { id: string };
            Body: Partial<CreateSimpleEventBody>;
        }>,
        reply: FastifyReply
    ) {
        try {
            const { id } = request.params;
            const updateData = request.body;
            
            console.log('📝 Actualizando evento ID:', id);
            console.log('📤 Datos recibidos para actualizar:', updateData);

            const existingEvent = await prisma.event.findUnique({
                where: { id }
            });

            if (!existingEvent) {
                return reply.status(404).send({
                    success: false,
                    error: 'Evento no encontrado'
                });
            }

            if (updateData.slug && updateData.slug !== existingEvent.slug) {
                const slugExists = await prisma.event.findUnique({
                    where: { slug: updateData.slug }
                });

                if (slugExists) {
                    return reply.status(400).send({
                        success: false,
                        error: 'Ya existe un evento con ese slug'
                    });
                }
            }

            // Solo permitir campos que existen en el modelo de Prisma
            const allowedFields = [
                'name', 'slug', 'description', 'eventDate', 'saleStartDate', 'saleEndDate',
                'status', 'category', 'subcategory', 'doorsOpenTime', 'availableTickets',
                'reservedTickets', 'soldTickets', 'bannerImage', 'thumbnailImage'
            ];
            
            const dataToUpdate: any = {};
            
            // Solo copiar campos permitidos
            for (const field of allowedFields) {
                if (updateData[field] !== undefined) {
                    dataToUpdate[field] = updateData[field];
                }
            }
            
            // Informar sobre campos ignorados (para debug)
            const ignoredFields = Object.keys(updateData).filter(field => !allowedFields.includes(field));
            if (ignoredFields.length > 0) {
                console.log('⚠️ Campos ignorados (se mantienen valores originales):', ignoredFields);
            }
            console.log('✅ Campos que se actualizarán:', Object.keys(dataToUpdate));
            
            // Validar status si existe
            if (dataToUpdate.status && !['DRAFT', 'ACTIVE', 'CANCELLED', 'COMPLETED'].includes(dataToUpdate.status)) {
                delete dataToUpdate.status;
                console.log('⚠️ Status inválido removido:', dataToUpdate.status);
            }
            
            // Convertir fechas si están presentes
            if (dataToUpdate.eventDate) {
                dataToUpdate.eventDate = new Date(dataToUpdate.eventDate);
            }
            if (dataToUpdate.saleStartDate) {
                dataToUpdate.saleStartDate = new Date(dataToUpdate.saleStartDate);
            }
            if (dataToUpdate.saleEndDate) {
                dataToUpdate.saleEndDate = new Date(dataToUpdate.saleEndDate);
            }
            
            dataToUpdate.updatedAt = new Date();
            
            console.log('📋 Datos finales para actualizar en BD:', dataToUpdate);

            let updatedEvent;
            try {
                updatedEvent = await prisma.event.update({
                    where: { id },
                    data: dataToUpdate,
                    include: {
                        venue: {
                            select: {
                                id: true,
                                name: true,
                                city: true,
                            }
                        }
                    }
                });
            } catch (dbError: any) {
                console.error('❌ Error específico de base de datos:', dbError);
                console.error('❌ DB Error code:', dbError.code);
                console.error('❌ DB Error meta:', dbError.meta);
                throw dbError;
            }

            console.log(`Evento actualizado: ${updatedEvent.id}`);
            console.log('📋 Datos del evento después de actualizar:', JSON.stringify(updatedEvent, null, 2));

            return reply.send({
                success: true,
                message: 'Evento actualizado exitosamente',
                data: updatedEvent,
                updatedFields: Object.keys(dataToUpdate).filter(key => key !== 'updatedAt'),
                ignoredFields: ignoredFields
            });
        } catch (error: any) {
            console.error('❌ Error updating rock event:', error);
            console.error('❌ Error message:', error.message);
            console.error('❌ Error stack:', error.stack);
            console.error('❌ Update data received:', request.body);
            
            return reply.status(500).send({
                success: false,
                error: error.message || 'Error interno del servidor',
                details: error.stack
            });
        }
    }

    async deleteRockEvent(
        request: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ) {
        try {
            const { id } = request.params;

            const existingEvent = await prisma.event.findUnique({
                where: { id }
            });

            if (!existingEvent) {
                return reply.status(404).send({
                    success: false,
                    error: 'Evento no encontrado'
                });
            }

            await prisma.event.delete({
                where: { id }
            });

            console.log(`Evento eliminado: ${id}`);

            return reply.send({
                success: true,
                message: 'Evento eliminado exitosamente'
            });
        } catch (error: any) {
            console.error('Error deleting rock event:', error);
            return reply.status(500).send({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }

    // ==================== MÉTODOS PÚBLICOS (SIN AUTENTICACIÓN) ====================
    
    /**
     * Listar eventos públicos para users (sin autenticación)
     */
    async listPublicEvents(request: FastifyRequest, reply: FastifyReply) {
        try {
            const events = await prisma.event.findMany({
                where: {
                    status: EventStatus.ACTIVE,
                    availableTickets: { gt: 0 }
                    // Filtros de fecha opcionales (puedes activarlos después)
                    // saleStartDate: { lte: new Date() },
                    // saleEndDate: { gte: new Date() }
                },
                include: {
                    venue: {
                        select: {
                            id: true,
                            name: true,
                            city: true,
                            capacity: true,
                            address: true
                        }
                    }
                },
                orderBy: {
                    eventDate: 'asc'
                }
            });

            // Formatear para user-service
            const formattedEvents = events.map(event => ({
                id: event.id,
                name: event.name,
                description: event.description,
                eventDate: event.eventDate,
                saleStartDate: event.saleStartDate,
                saleEndDate: event.saleEndDate,
                totalCapacity: event.totalCapacity,
                availableTickets: event.availableTickets,
                minPrice: event.minPrice,
                maxPrice: event.maxPrice,
                status: event.status,
                category: event.genre,
                subcategory: event.format,
                venue: event.venue
            }));

            return reply.send({
                success: true,
                data: formattedEvents,
                total: formattedEvents.length
            });
        } catch (error: any) {
            logger.error('Error obteniendo eventos públicos:', error);
            return reply.status(500).send({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }

    /**
     * Obtener evento público por ID (sin autenticación)
     */
    async getPublicEventById(
        request: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ) {
        try {
            const { id } = request.params;

            const event = await prisma.event.findUnique({
                where: { 
                    id,
                    status: EventStatus.ACTIVE
                    // Filtros de fecha opcionales (puedes activarlos después)
                    // saleStartDate: { lte: new Date() },
                    // saleEndDate: { gte: new Date() }
                },
                include: {
                    venue: {
                        select: {
                            id: true,
                            name: true,
                            city: true,
                            capacity: true,
                            address: true,
                            state: true,
                            country: true
                        }
                    }
                }
            });

            if (!event) {
                return reply.status(404).send({
                    success: false,
                    error: 'Evento no encontrado o no disponible'
                });
            }

            // Formatear para user-service
            const formattedEvent = {
                id: event.id,
                name: event.name,
                description: event.description,
                eventDate: event.eventDate,
                saleStartDate: event.saleStartDate,
                saleEndDate: event.saleEndDate,
                totalCapacity: event.totalCapacity,
                availableTickets: event.availableTickets,
                minPrice: event.minPrice,
                maxPrice: event.maxPrice,
                status: event.status,
                category: event.genre,
                subcategory: event.format,
                venue: event.venue
            };

            return reply.send({
                success: true,
                data: formattedEvent
            });
        } catch (error: any) {
            logger.error('Error obteniendo evento público:', error);
            return reply.status(500).send({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }

}

export default new SimpleEventController();
