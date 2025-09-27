import { Request, Response } from "express";
import { adminApiService, AdminEvent } from "../services/admin-api.service";

class EventController {
  /**
   * Obtener todos los eventos desde el admin-service
   */
  getAllEvents = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('[User Service] Fetching events from admin service...');
      
      const events: AdminEvent[] = await adminApiService.getEvents();
      
      // Los eventos ya vienen filtrados desde admin-service (solo ACTIVE con tickets disponibles)
      const availableEvents = events;

      res.json({
        success: true,
        data: availableEvents,
        total: availableEvents.length,
        source: 'admin-service'
      });
    } catch (error: any) {
      console.error('[User Service] Error fetching events:', error.message);
      res.status(500).json({
        success: false,
        error: 'No se pudieron obtener los eventos. Servicio temporalmente no disponible.',
        details: error.message
      });
    }
  };

  /**
   * Obtener un evento específico por ID desde el admin-service
   */
  getEventById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      console.log(`[User Service] Fetching event ${id} from admin service...`);

      const event: AdminEvent | null = await adminApiService.getEventById(id);

      if (!event) {
        res.status(404).json({
          success: false,
          error: "Evento no encontrado"
        });
        return;
      }

      // El evento ya viene filtrado desde admin-service si está disponible
      const isAvailable = event.availableTickets > 0;

      res.json({
        success: true,
        data: {
          ...event,
          isAvailable,
          canPurchase: isAvailable
        },
        source: 'admin-service'
      });
    } catch (error: any) {
      console.error(`[User Service] Error fetching event ${req.params.id}:`, error.message);
      res.status(500).json({
        success: false,
        error: 'No se pudo obtener el evento',
        details: error.message
      });
    }
  };

  /**
   * Buscar eventos (filtrado local de los eventos obtenidos del admin-service)
   */
  searchEvents = async (req: Request, res: Response): Promise<void> => {
    try {
      const { q, category, city, minPrice, maxPrice } = req.query;
      console.log('[User Service] Searching events with filters:', { q, category, city, minPrice, maxPrice });

      const allEvents: AdminEvent[] = await adminApiService.getEvents();
      
      // Los eventos ya vienen filtrados desde admin-service
      let filteredEvents = allEvents;

      // Aplicar filtros de búsqueda
      if (q) {
        const query = (q as string).toLowerCase();
        filteredEvents = filteredEvents.filter(event =>
          event.name.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query) ||
          event.venue.name.toLowerCase().includes(query)
        );
      }

      if (category) {
        filteredEvents = filteredEvents.filter(event =>
          event.category.toLowerCase().includes((category as string).toLowerCase()) ||
          event.subcategory.toLowerCase().includes((category as string).toLowerCase())
        );
      }

      if (city) {
        filteredEvents = filteredEvents.filter(event =>
          event.venue.city.toLowerCase().includes((city as string).toLowerCase())
        );
      }

      if (minPrice) {
        filteredEvents = filteredEvents.filter(event =>
          event.minPrice >= parseFloat(minPrice as string)
        );
      }

      if (maxPrice) {
        filteredEvents = filteredEvents.filter(event =>
          event.maxPrice <= parseFloat(maxPrice as string)
        );
      }

      res.json({
        success: true,
        data: filteredEvents,
        total: filteredEvents.length,
        filters: { q, category, city, minPrice, maxPrice },
        source: 'admin-service'
      });
    } catch (error: any) {
      console.error('[User Service] Error searching events:', error.message);
      res.status(500).json({
        success: false,
        error: 'Error en la búsqueda de eventos',
        details: error.message
      });
    }
  };

  /**
   * Verificar disponibilidad de un evento
   */
  checkAvailability = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { tickets = 1 } = req.query;

      const isAvailable = await adminApiService.checkEventAvailability(
        id, 
        parseInt(tickets as string)
      );

      res.json({
        success: true,
        eventId: id,
        isAvailable,
        requestedTickets: parseInt(tickets as string)
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Error verificando disponibilidad',
        details: error.message
      });
    }
  };
}

export default EventController;
