"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = require("../services");
class EventController {
    eventService;
    constructor() {
        this.eventService = new services_1.EventService();
    }
    getAllEvents = async (req, res) => {
        try {
            const events = await this.eventService.getAllEvents();
            res.json({
                success: true,
                data: events,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    };
    getEventById = async (req, res) => {
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
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    };
    searchEvents = async (req, res) => {
        try {
            const { q, category, date } = req.query;
            const events = await this.eventService.searchEvents({
                query: q,
                category: category,
                date: date,
            });
            res.json({
                success: true,
                data: events,
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
exports.default = EventController;
//# sourceMappingURL=event.controller.js.map