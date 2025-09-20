import { Request, Response } from "express";
import { TicketService } from "../services";

class TicketController {
  private ticketService: TicketService;

  constructor() {
    this.ticketService = new TicketService();
  }

  reserveTickets = async (req: Request, res: Response): Promise<void> => {
    try {
      const { eventId, userId, seats } = req.body;

      if (!eventId || !userId || !seats || seats.length === 0) {
        res.status(400).json({
          success: false,
          error: "Missing required fields",
        });
        return;
      }

      const ticket = await this.ticketService.reserveTickets({
        eventId,
        userId,
        seats,
      });

      res.status(201).json({
        success: true,
        data: ticket,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };

  confirmTicket = async (req: Request, res: Response): Promise<void> => {
    try {
      const { ticketId } = req.params;
      const ticket = await this.ticketService.confirmTicket(ticketId);

      if (!ticket) {
        res.status(404).json({
          success: false,
          error: "Ticket not found or expired",
        });
        return;
      }

      res.json({
        success: true,
        data: ticket,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };

  getUserTickets = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const tickets = await this.ticketService.getUserTickets(userId);

      res.json({
        success: true,
        data: tickets,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };

  getTicketById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { ticketId } = req.params;
      const ticket = await this.ticketService.getTicketById(ticketId);

      if (!ticket) {
        res.status(404).json({
          success: false,
          error: "Ticket not found",
        });
        return;
      }

      res.json({
        success: true,
        data: ticket,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };
}

export default TicketController;
export { TicketController };
