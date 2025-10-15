import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { RabbitMQService } from '../services/rabbitmq.service';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

const createVenueSchema = z.object({
    name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    slug: z
        .string()
        .regex(/^[a-z0-9-]+$/, 'El slug debe contener solo letras minúsculas, números y guiones'),
    capacity: z.number().int().positive('La capacidad debe ser un número positivo'),
    address: z.string().min(5),
    city: z.string().min(2),
    state: z.string().optional(),
    country: z.string().default('España'),
    postalCode: z.string(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    description: z.string().optional(),
    amenities: z.array(z.string()).default([]),
    images: z.array(z.string().url()).default([]),
    sections: z
        .array(
            z.object({
                name: z.string(),
                capacity: z.number().int().positive(),
                rowCount: z.number().int().positive().optional(),
                seatsPerRow: z.number().int().positive().optional(),
            })
        )
        .optional(),
});

const updateVenueSchema = createVenueSchema.partial();

const venueQuerySchema = z.object({
    page: z.string().optional().default('1').transform(Number),
    limit: z.string().optional().default('1000').transform(Number),
    search: z.string().optional(),
    city: z.string().optional(),
    isActive: z
        .string()
        .optional()
        .transform(val => (val === undefined ? undefined : val === 'true')),
    minCapacity: z.string().optional().transform(Number),
    maxCapacity: z.string().optional().transform(Number),
});

type CreateVenueDTO = z.infer<typeof createVenueSchema>;
type UpdateVenueDTO = z.infer<typeof updateVenueSchema>;
type VenueQueryDTO = z.infer<typeof venueQuerySchema>;

export class VenueController {
    private rabbitmq: RabbitMQService;

    constructor(rabbitmqService: RabbitMQService) {
        this.rabbitmq = rabbitmqService;
    }

    /**
     * Crear un nuevo venue
     */
    async create(request: FastifyRequest<{ Body: CreateVenueDTO }>, reply: FastifyReply) {
        try {
            const validatedData = createVenueSchema.parse(request.body);

            const existingVenue = await prisma.venue.findUnique({
                where: { slug: validatedData.slug },
            });

            if (existingVenue) {
                return reply.status(400).send({
                    error: 'Ya existe un venue con ese slug',
                });
            }

            const { sections, ...venueData } = validatedData;

            const venue = await prisma.venue.create({
                data: {
                    ...venueData,
                    createdById: request.user.id,
                    sections: sections
                        ? {
                              create: sections,
                          }
                        : undefined,
                },
                include: {
                    sections: true,
                    createdBy: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
            });

            await this.rabbitmq.publishEvent('venue.created', {
                venueId: venue.id,
                venueName: venue.name,
                capacity: venue.capacity,
                adminId: request.user.id,
                timestamp: new Date(),
            });

            logger.info(`Venue creado: ${venue.id} por admin: ${request.user.id}`);

            return reply.status(201).send({
                message: 'Venue creado exitosamente',
                venue,
            });
        } catch (error) {
            logger.error('Error creando venue:', error);
            if (error.name === 'ZodError') {
                return reply.status(400).send({
                    error: 'Datos inválidos',
                    details: error.errors,
                });
            }
            return reply.status(500).send({
                error: 'Error interno del servidor',
            });
        }
    }

    /**
     * Obtener todos los venues con filtros
     */
    async getAll(request: FastifyRequest<{ Querystring: VenueQueryDTO }>, reply: FastifyReply) {
        try {
            const query = venueQuerySchema.parse(request.query);
            const { page, limit, search, city, isActive, minCapacity, maxCapacity } = query;

            const where: any = {};

            if (typeof isActive === 'boolean') {
                where.isActive = isActive;
            }

            if (city) {
                where.city = { contains: city, mode: 'insensitive' };
            }

            if (search) {
                where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                    { address: { contains: search, mode: 'insensitive' } },
                ];
            }

            if (minCapacity || maxCapacity) {
                where.capacity = {};
                if (minCapacity) where.capacity.gte = minCapacity;
                if (maxCapacity) where.capacity.lte = maxCapacity;
            }

            const total = await prisma.venue.count({ where });

            const venues = await prisma.venue.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    sections: true,
                    _count: {
                        select: { events: true },
                    },
                },
                orderBy: {
                    name: 'asc',
                },
            });

                    return reply
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({
                    venues,
                    pagination: {
                        total,
                        page,
                        limit,
                        totalPages: Math.ceil(total / limit),
                    },
                });
        } catch (error) {
            logger.error('Error obteniendo venues:', error);
            return reply.status(500).send({
                error: 'Error interno del servidor',
            });
        }
    }

    /**
     * Obtener un venue por ID
     */
    async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        try {
            const { id } = request.params;

            const venue = await prisma.venue.findUnique({
                where: { id },
                include: {
                    sections: true,
                    createdBy: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                    events: {
                        where: {
                            status: 'ACTIVE',
                            eventDate: {
                                gte: new Date(),
                            },
                        },
                        orderBy: {
                            eventDate: 'asc',
                        },
                        take: 10,
                    },
                },
            });

            if (!venue) {
                return reply.status(404).send({
                    error: 'Venue no encontrado',
                });
            }

            return reply.send({ venue });
        } catch (error) {
            logger.error('Error obteniendo venue:', error);
            return reply.status(500).send({
                error: 'Error interno del servidor',
            });
        }
    }

    /**Buscar por Slug
     */
//     async getBySlug(
//   request: FastifyRequest<{ Params: { slug: string } }>,
//   reply: FastifyReply
// ) {
//   try {
//     const { slug } = request.params;

//     const venue = await prisma.venue.findUnique({
//       where: { slug }, 
//       include: {
//         sections: true,
//         createdBy: {
//           select: {
//             id: true,
//             email: true,
//             firstName: true,
//             lastName: true,
//           },
//         },
//         events: {
//           where: {
//             status: 'ACTIVE',
//             eventDate: {
//               gte: new Date(),
//             },
//           },
//           orderBy: {
//             eventDate: 'asc',
//           },
//           take: 10,
//         },
//       },
//     });

//     if (!venue) {
//       return reply.status(404).send({
//         error: 'Venue no encontrado',
//       });
//     }

//     return reply.send({ venue });
//   } catch (error) {
//     logger.error('Error obteniendo venue por slug:', error);
//     return reply.status(500).send({
//       error: 'Error interno del servidor',
//     });
//   }
// }


    /**
     * Actualizar un venue
     */
    async update(
        request: FastifyRequest<{
            Params: { id: string };
            Body: UpdateVenueDTO;
        }>,
        reply: FastifyReply
    ) {
        try {
            const { id } = request.params;
            const validatedData = updateVenueSchema.parse(request.body);

            const existingVenue = await prisma.venue.findUnique({
                where: { id },
            });

            if (!existingVenue) {
                return reply.status(404).send({
                    error: 'Venue no encontrado',
                });
            }

            if (validatedData.slug && validatedData.slug !== existingVenue.slug) {
                const slugExists = await prisma.venue.findUnique({
                    where: { slug: validatedData.slug },
                });

                if (slugExists) {
                    return reply.status(400).send({
                        error: 'Ya existe un venue con ese slug',
                    });
                }
            }

            const venue = await prisma.venue.update({
                where: { id },
                data: validatedData,
                include: {
                    sections: true,
                    createdBy: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
            });

            await this.rabbitmq.publishEvent('venue.updated', {
                venueId: venue.id,
                venueName: venue.name,
                adminId: request.user.id,
                changes: Object.keys(validatedData),
                timestamp: new Date(),
            });

            logger.info(`Venue actualizado: ${venue.id} por admin: ${request.user.id}`);

            return reply.send({
                message: 'Venue actualizado exitosamente',
                venue,
            });
        } catch (error) {
            logger.error('Error actualizando venue:', error);
            if (error.name === 'ZodError') {
                return reply.status(400).send({
                    error: 'Datos inválidos',
                    details: error.errors,
                });
            }
            return reply.status(500).send({
                error: 'Error interno del servidor',
            });
        }
    }

    /**
     * Desactivar un venue
     */
    async deactivate(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        try {
            const { id } = request.params;

            const activeEvents = await prisma.event.count({
                where: {
                    venueId: id,
                    status: 'ACTIVE',
                    eventDate: {
                        gte: new Date(),
                    },
                },
            });

            if (activeEvents > 0) {
                return reply.status(400).send({
                    error: `No se puede desactivar el venue. Tiene ${activeEvents} eventos activos`,
                });
            }

            const venue = await prisma.venue.update({
                where: { id },
                data: { isActive: false },
            });

            await this.rabbitmq.publishEvent('venue.deactivated', {
                venueId: venue.id,
                venueName: venue.name,
                adminId: request.user.id,
                timestamp: new Date(),
            });

            logger.info(`Venue desactivado: ${venue.id} por admin: ${request.user.id}`);

            return reply.send({
                message: 'Venue desactivado exitosamente',
            });
        } catch (error) {
            logger.error('Error desactivando venue:', error);
            return reply.status(500).send({
                error: 'Error interno del servidor',
            });
        }
    }

    /**
     * Activar un venue
     */
    async activate(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        try {
            const { id } = request.params;

            const venue = await prisma.venue.update({
                where: { id },
                data: { isActive: true },
            });

            await this.rabbitmq.publishEvent('venue.activated', {
                venueId: venue.id,
                venueName: venue.name,
                adminId: request.user.id,
                timestamp: new Date(),
            });

            logger.info(`Venue activado: ${venue.id} por admin: ${request.user.id}`);

            return reply.send({
                message: 'Venue activado exitosamente',
                venue,
            });
        } catch (error) {
            logger.error('Error activando venue:', error);
            return reply.status(500).send({
                error: 'Error interno del servidor',
            });
        }
    }

    /**
     * Gestionar secciones de un venue
     */
    async manageSections(
        request: FastifyRequest<{
            Params: { id: string };
            Body: {
                action: 'add' | 'update' | 'remove';
                section: {
                    id?: string;
                    name: string;
                    capacity: number;
                    rowCount?: number;
                    seatsPerRow?: number;
                };
            };
        }>,
        reply: FastifyReply
    ) {
        try {
            const { id } = request.params;
            const { action, section } = request.body;

            let result;

            switch (action) {
                case 'add':
                    result = await prisma.venueSection.create({
                        data: {
                            venueId: id,
                            ...section,
                        },
                    });
                    break;

                case 'update':
                    if (!section.id) {
                        return reply.status(400).send({
                            error: 'ID de sección requerido para actualizar',
                        });
                    }
                    result = await prisma.venueSection.update({
                        where: { id: section.id },
                        data: section,
                    });
                    break;

                case 'remove':
                    if (!section.id) {
                        return reply.status(400).send({
                            error: 'ID de sección requerido para eliminar',
                        });
                    }
                    await prisma.venueSection.delete({
                        where: { id: section.id },
                    });
                    result = { message: 'Sección eliminada' };
                    break;
            }

            const venue = await prisma.venue.findUnique({
                where: { id },
                include: { sections: true },
            });

            return reply.send({
                message: `Sección ${
                    action === 'add'
                        ? 'agregada'
                        : action === 'update'
                        ? 'actualizada'
                        : 'eliminada'
                }`,
                venue,
            });
        } catch (error) {
            logger.error('Error gestionando secciones:', error);
            return reply.status(500).send({
                error: 'Error interno del servidor',
            });
        }
    }

    /**
     * Obtener estadísticas de venues
     */
    async getStats(request: FastifyRequest, reply: FastifyReply) {
        try {
            const [total, active, withEvents, cities] = await Promise.all([
                prisma.venue.count(),
                prisma.venue.count({ where: { isActive: true } }),
                prisma.venue.count({
                    where: {
                        events: { some: { status: 'ACTIVE' } },
                    },
                }),
                prisma.venue.groupBy({
                    by: ['city'],
                    _count: true,
                    orderBy: { _count: { city: 'desc' } },
                    take: 10,
                }),
            ]);

            const largestVenues = await prisma.venue.findMany({
                where: { isActive: true },
                orderBy: { capacity: 'desc' },
                take: 5,
                select: {
                    id: true,
                    name: true,
                    city: true,
                    capacity: true,
                    _count: {
                        select: { events: true },
                    },
                },
            });

            return reply.send({
                stats: {
                    total,
                    active,
                    withEvents,
                    inactive: total - active,
                },
                topCities: cities.map(c => ({
                    city: c.city,
                    count: c._count,
                })),
                largestVenues,
            });
        } catch (error) {
            logger.error('Error obteniendo estadísticas:', error);
            return reply.status(500).send({
                error: 'Error interno del servidor',
            });
        }
    }

    /**
     * Eliminar un venue
     */
    async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        try {
            const { id } = request.params;

            const existingVenue = await prisma.venue.findUnique({
                where: { id },
                include: {
                    events: {
                        where: {
                            status: 'ACTIVE',
                            eventDate: {
                                gte: new Date()
                            }
                        }
                    }
                }
            });

            if (!existingVenue) {
                return reply.status(404).send({
                    error: 'Venue no encontrado'
                });
            }

            if (existingVenue.events.length > 0) {
                return reply.status(400).send({
                    error: `No se puede eliminar el venue. Tiene ${existingVenue.events.length} eventos activos programados`
                });
            }

            await prisma.venue.delete({
                where: { id }
            });

            await this.rabbitmq.publishEvent('venue.deleted', {
                venueId: id,
                venueName: existingVenue.name,
                adminId: request.user.id,
                timestamp: new Date(),
            });

            logger.info(`Venue eliminado: ${id} por admin: ${request.user.id}`);

            return reply.send({
                message: 'Venue eliminado exitosamente',
                venue: {
                    id: existingVenue.id,
                    name: existingVenue.name
                }
            });
        } catch (error) {
            logger.error('Error deleting venue:', error);
            return reply.status(500).send({
                error: 'Error interno del servidor'
            });
        }
    }
}

export default new VenueController();
