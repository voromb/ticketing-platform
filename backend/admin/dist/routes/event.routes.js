"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventRoutes = eventRoutes;
const event_controller_1 = __importDefault(require("../controllers/event.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
async function eventRoutes(fastify) {
    // ==================== RUTAS PÚBLICAS ====================
    fastify.get('/public', event_controller_1.default.listRockEvents.bind(event_controller_1.default)); // lista pública de eventos
    fastify.get('/public/:id', event_controller_1.default.getEventById.bind(event_controller_1.default));
    // ==================== RUTAS PRIVADAS ====================
    fastify.register(async function (fastify) {
        fastify.addHook('preHandler', auth_middleware_1.authMiddleware);
        fastify.post('/', event_controller_1.default.createEvent.bind(event_controller_1.default));
        fastify.get('/', event_controller_1.default.listRockEvents.bind(event_controller_1.default)); // lista filtrando por rock/metal
        fastify.get('/:id', event_controller_1.default.getEventById.bind(event_controller_1.default));
        fastify.put('/:id', event_controller_1.default.updateEvent.bind(event_controller_1.default));
        fastify.patch('/:id', event_controller_1.default.updateEvent.bind(event_controller_1.default));
        fastify.delete('/:id', event_controller_1.default.deleteEvent.bind(event_controller_1.default));
    });
}
