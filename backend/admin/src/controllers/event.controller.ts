import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient, EventStatus } from '@prisma/client';
import { logger } from '../utils/logger';
import { CreateEventDTO, UpdateEventDTO, EventQueryDTO } from '../dto/event.dto';

const prisma = new PrismaClient();

class EventController {

  // ==================== CREAR EVENTO ====================
  async createEvent(
    request: FastifyRequest<{ Body: CreateEventDTO }>,
    reply: FastifyReply
  ) {
    try {
      const user = (request as any).user;
      const data = request.body;

      if (!user?.id) return reply.code(403).send({ error: 'Usuario no autenticado' });

      // Validaciones de venue
      const venue = await prisma.venue.findUnique({ where: { id: data.venueId } });
      if (!venue) return reply.code(404).send({ error: 'Venue no encontrado' });
      if (data.totalCapacity > venue.capacity) {
        return reply.code(400).send({
          error: `Capacidad total (${data.totalCapacity}) excede la del venue (${venue.capacity})`
        });
      }

      // Validar slug
      const existingEvent = await prisma.event.findUnique({ where: { slug: data.slug } });
      if (existingEvent) return reply.code(400).send({ error: 'Slug ya existe' });

      // Validar categoría y subcategoría
      const category = await prisma.eventCategory.findUnique({ where: { id: data.categoryId } });
      if (!category) return reply.code(400).send({ error: 'Categoría no encontrada' });

      const subcategory = await prisma.eventSubcategory.findUnique({ where: { id: data.subcategoryId } });
      if (!subcategory) return reply.code(400).send({ error: 'Subcategoría no encontrada' });

      // Crear evento
      const event = await prisma.event.create({
        data: {
          name: data.name,
          description: data.description || `${category.name} - ${subcategory.name}`,
          slug: data.slug,
          status: EventStatus.DRAFT,
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
          createdById: user.id
        },
        include: { venue: true, category: true, subcategory: true }
      });

      return reply.code(201).send({
        success: true,
        data: event,
        message: `Evento ${category.name} - ${subcategory.name} creado exitosamente!`
      });

    } catch (error: any) {
      logger.error('Error creating event:', error);
      return reply.status(500).send({ success: false, error: error.message || 'Error interno' });
    }
  }

  // Métodos públicos (sin autenticación)
  async listRockEvents(
    request: FastifyRequest<{ Querystring: EventQueryDTO }>,
    reply: FastifyReply
  ) {
    try {
      const events = await prisma.$queryRaw`
        SELECT 
          e.*,
          v.name as venue_name,
          v.city as venue_city,
          v.capacity as venue_capacity,
          v.address as venue_address
        FROM "Event" e
        LEFT JOIN "Venue" v ON e."venueId" = v.id
        ORDER BY e."eventDate" ASC
      `;

      return reply.send({ success: true, data: events });
    } catch (error: any) {
      logger.error('Error listing events:', error);
      return reply.status(500).send({ success: false, error: 'Error interno del servidor' });
    }
  }

  // ==================== GET EVENTO POR ID ====================
  async getEventById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = request.params;
      const event = await prisma.event.findUnique({
        where: { id },
        include: { venue: true }
      });

      if (!event) return reply.status(404).send({ success: false, error: 'Evento no encontrado' });
      return reply.send({ success: true, data: event });
    } catch (error: any) {
      logger.error('Error getting event by ID:', error);
      return reply.status(500).send({ success: false, error: 'Error interno' });
    }
  }

  // ==================== ACTUALIZAR EVENTO ====================
  async updateEvent(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateEventDTO }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const updateData = request.body;

      const existingEvent = await prisma.event.findUnique({ where: { id } });
      if (!existingEvent) return reply.status(404).send({ success: false, error: 'Evento no encontrado' });

      if (updateData.slug && updateData.slug !== existingEvent.slug) {
        const slugExists = await prisma.event.findUnique({ where: { slug: updateData.slug } });
        if (slugExists) return reply.status(400).send({ success: false, error: 'Slug ya existe' });
      }

      if (updateData.categoryId) {
        const cat = await prisma.eventCategory.findUnique({ where: { id: updateData.categoryId } });
        if (!cat) return reply.status(400).send({ error: 'Categoría inválida' });
      }

      if (updateData.subcategoryId) {
        const sub = await prisma.eventSubcategory.findUnique({ where: { id: updateData.subcategoryId } });
        if (!sub) return reply.status(400).send({ error: 'Subcategoría inválida' });
      }

      if (updateData.eventDate) updateData.eventDate = new Date(updateData.eventDate);
      if (updateData.saleStartDate) updateData.saleStartDate = new Date(updateData.saleStartDate);
      if (updateData.saleEndDate) updateData.saleEndDate = new Date(updateData.saleEndDate);

      const updatedEvent = await prisma.event.update({
        where: { id },
        data: { ...updateData, updatedAt: new Date() },
        include: { venue: true, category: true, subcategory: true }
      });

      return reply.send({ success: true, data: updatedEvent, message: 'Evento actualizado exitosamente' });
    } catch (error: any) {
      logger.error('Error updating event:', error);
      return reply.status(500).send({ success: false, error: 'Error interno' });
    }
  }

  // ==================== ELIMINAR EVENTO ====================
  async deleteEvent(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = request.params;
      const existingEvent = await prisma.event.findUnique({ where: { id } });
      if (!existingEvent) return reply.status(404).send({ success: false, error: 'Evento no encontrado' });

      await prisma.event.delete({ where: { id } });
      return reply.send({ success: true, message: 'Evento eliminado exitosamente' });
    } catch (error: any) {
      logger.error('Error deleting event:', error);
      return reply.status(500).send({ success: false, error: 'Error interno' });
    }
  }
}

export default new EventController();
