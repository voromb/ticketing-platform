import { Request, Response } from "express";
import { EventService } from "../services";

class EventController {
  private eventService: EventService;

  constructor() {
    this.eventService = new EventService();
  }

  getAllEvents = async (req: Request, res: Response): Promise<void> => {
    try {
      const events = await this.eventService.getAllEvents();
      res.json({
        success: true,
        data: events,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };

  getEventById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const event = await this.eventService.getEventById(id);

      if (!event) {
        res.status(404).json({
          success: false,
          error: "Event not found",
        });
        return;
      }

      res.json({
        success: true,
        data: event,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };

  searchEvents = async (req: Request, res: Response): Promise<void> => {
    try {
      const { q, category, date } = req.query;
      const events = await this.eventService.searchEvents({
        query: q as string,
        category: category as string,
        date: date as string,
      });

      res.json({
        success: true,
        data: events,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };
}

export default EventController;
