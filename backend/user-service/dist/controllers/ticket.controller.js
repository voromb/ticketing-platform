"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketController = void 0;
const services_1 = require("../services");
class TicketController {
    ticketService;
    constructor() {
        this.ticketService = new services_1.TicketService();
    }
    reserveTickets = async (req, res) => {
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
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    };
    confirmTicket = async (req, res) => {
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
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    };
    getUserTickets = async (req, res) => {
        try {
            const { userId } = req.params;
            const tickets = await this.ticketService.getUserTickets(userId);
            res.json({
                success: true,
                data: tickets,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    };
    getTicketById = async (req, res) => {
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
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    };
}
exports.TicketController = TicketController;
exports.default = TicketController;
//# sourceMappingURL=ticket.controller.js.map