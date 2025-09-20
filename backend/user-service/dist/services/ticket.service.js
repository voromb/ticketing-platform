"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketService = void 0;
const ticket_model_1 = __importDefault(require("../models/ticket.model"));
const index_1 = require("./index");
const rabbitmq_1 = require("../config/rabbitmq");
const utils_1 = require("../utils");
class TicketService {
    eventService;
    constructor() {
        this.eventService = new index_1.EventService();
    }
    async reserveTickets(data) {
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
            const ticket = await ticket_model_1.default.create({
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
            await (0, rabbitmq_1.publishEvent)("ticket.reserved", {
                ticketId: ticket._id,
                eventId: data.eventId,
                userId: data.userId,
                seats: data.seats,
            });
            return ticket;
        }
        catch (error) {
            throw error;
        }
    }
    async confirmTicket(ticketId) {
        try {
            const ticket = await ticket_model_1.default.findById(ticketId);
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
            const qrCode = await (0, utils_1.generateQRCode)(ticketId);
            // Actualizar ticket
            ticket.status = "paid";
            ticket.purchasedAt = new Date();
            ticket.qrCode = qrCode;
            await ticket.save();
            // Actualizar asientos disponibles
            await this.eventService.updateAvailableSeats(ticket.eventId.toString(), ticket.seats.length);
            // Publicar evento a RabbitMQ
            await (0, rabbitmq_1.publishEvent)("ticket.purchased", {
                ticketId: ticket._id,
                eventId: ticket.eventId,
                userId: ticket.userId,
                seats: ticket.seats,
                amount: ticket.finalPrice,
            });
            return ticket;
        }
        catch (error) {
            throw error;
        }
    }
    async getUserTickets(userId) {
        try {
            const tickets = await ticket_model_1.default.find({
                userId,
                status: { $in: ["paid", "used"] },
            })
                .populate("eventId")
                .sort({ createdAt: -1 });
            return tickets;
        }
        catch (error) {
            throw error;
        }
    }
    async getTicketById(ticketId) {
        try {
            const ticket = await ticket_model_1.default.findById(ticketId).populate("eventId");
            return ticket;
        }
        catch (error) {
            throw error;
        }
    }
}
exports.TicketService = TicketService;
exports.default = TicketService;
//# sourceMappingURL=ticket.service.js.map