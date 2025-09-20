"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventService = void 0;
const event_model_1 = __importDefault(require("../models/event.model"));
class EventService {
    async getAllEvents() {
        try {
            const events = await event_model_1.default.find({ status: 'published' })
                .sort({ date: 1 })
                .limit(50);
            return events;
        }
        catch (error) {
            throw error;
        }
    }
    async getEventById(id) {
        try {
            const event = await event_model_1.default.findById(id);
            return event;
        }
        catch (error) {
            throw error;
        }
    }
    async searchEvents(params) {
        try {
            const query = { status: 'published' };
            if (params.query) {
                query.$or = [
                    { name: { $regex: params.query, $options: 'i' } },
                    { description: { $regex: params.query, $options: 'i' } }
                ];
            }
            if (params.category) {
                query.category = params.category;
            }
            if (params.date) {
                const searchDate = new Date(params.date);
                const nextDay = new Date(searchDate);
                nextDay.setDate(nextDay.getDate() + 1);
                query.date = {
                    $gte: searchDate,
                    $lt: nextDay
                };
            }
            const events = await event_model_1.default.find(query)
                .sort({ date: 1 })
                .limit(20);
            return events;
        }
        catch (error) {
            throw error;
        }
    }
    async updateAvailableSeats(eventId, seatsToReduce) {
        try {
            const event = await event_model_1.default.findByIdAndUpdate(eventId, { $inc: { availableSeats: -seatsToReduce } }, { new: true });
            if (event && event.availableSeats === 0) {
                event.status = 'sold_out';
                await event.save();
            }
            return event;
        }
        catch (error) {
            throw error;
        }
    }
}
exports.EventService = EventService;
exports.default = EventService;
//# sourceMappingURL=event.service.js.map