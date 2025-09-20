import Ticket, { ITicket } from "../models/ticket.model";
import { EventService } from "./index";
import { publishEvent } from "../config/rabbitmq";
import { generateQRCode } from "../utils";

interface ReserveTicketDto {
  eventId: string;
  userId: string;
  seats: string[];
}

class TicketService {
  private eventService: EventService;

  constructor() {
    this.eventService = new EventService();
  }

  async reserveTickets(data: ReserveTicketDto): Promise<ITicket> {
    try {
      // Obtener información del evento
      const event = await this.eventService.getEventById(data.eventId);
      if (!event) {
        throw new Error("Event not found");
      }

      if (event.availableSeats < data.seats.length) {
        throw new Error("Not enough seats available");
      }

      // Calcular precio
      const totalPrice = event.basePrice * data.seats.length;

      // Crear ticket en estado reservado
      const ticket = await Ticket.create({
        eventId: data.eventId,
        userId: data.userId,
        seats: data.seats,
        price: event.basePrice,
        finalPrice: totalPrice,
        status: "reserved",
        reservedAt: new Date(),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutos
      });

      // Publicar evento a RabbitMQ
      await publishEvent("ticket.reserved", {
        ticketId: ticket._id,
        eventId: data.eventId,
        userId: data.userId,
        seats: data.seats,
      });

      return ticket;
    } catch (error) {
      throw error;
    }
  }

  async confirmTicket(ticketId: string): Promise<ITicket | null> {
    try {
      const ticket = await Ticket.findById(ticketId);

      if (!ticket) {
        return null;
      }

      // Verificar que no haya expirado
      if (new Date() > ticket.expiresAt) {
        ticket.status = "expired";
        await ticket.save();
        return null;
      }

      // Generar código QR
      const qrCode = await generateQRCode(ticketId);

      // Actualizar ticket
      ticket.status = "paid";
      ticket.purchasedAt = new Date();
      ticket.qrCode = qrCode;
      await ticket.save();

      // Actualizar asientos disponibles
      await this.eventService.updateAvailableSeats(
        ticket.eventId.toString(),
        ticket.seats.length
      );

      // Publicar evento a RabbitMQ
      await publishEvent("ticket.purchased", {
        ticketId: ticket._id,
        eventId: ticket.eventId,
        userId: ticket.userId,
        seats: ticket.seats,
        amount: ticket.finalPrice,
      });

      return ticket;
    } catch (error) {
      throw error;
    }
  }

  async getUserTickets(userId: string): Promise<ITicket[]> {
    try {
      const tickets = await Ticket.find({
        userId,
        status: { $in: ["paid", "used"] },
      })
        .populate("eventId")
        .sort({ createdAt: -1 });

      return tickets;
    } catch (error) {
      throw error;
    }
  }

  async getTicketById(ticketId: string): Promise<ITicket | null> {
    try {
      const ticket = await Ticket.findById(ticketId).populate("eventId");
      return ticket;
    } catch (error) {
      throw error;
    }
  }
}

export default TicketService;
export { TicketService };
