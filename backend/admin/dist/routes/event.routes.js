"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventRoutes = eventRoutes;
const event_controller_1 = __importDefault(require("../controllers/event.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
async function eventRoutes(fastify) {
    // ==================== RUTAS PÚBLICAS (SIN AUTENTICACIÓN) ====================
    // Para que user-service pueda consultar eventos
    // GET /api/events/public - Listar eventos públicos para users
    fastify.get('/public', event_controller_1.default.listPublicEvents.bind(event_controller_1.default));
    // GET /api/events/public/:id - Obtener evento público por ID
    fastify.get('/public/:id', event_controller_1.default.getPublicEventById.bind(event_controller_1.default));
    // ==================== RUTAS PRIVADAS (CON AUTENTICACIÓN) ====================
    // Para administradores - Registrar rutas con middleware específico
    fastify.register(async function (fastify) {
        fastify.addHook('preHandler', auth_middleware_1.authMiddleware);
        fastify.post('/', event_controller_1.default.createRockEvent.bind(event_controller_1.default));
        fastify.get('/', event_controller_1.default.listRockEvents.bind(event_controller_1.default));
        fastify.get('/stats', event_controller_1.default.getRockEventStats.bind(event_controller_1.default));
        fastify.get('/:id', event_controller_1.default.getRockEventById.bind(event_controller_1.default));
        fastify.put('/:id', event_controller_1.default.updateRockEvent.bind(event_controller_1.default));
        fastify.patch('/:id', event_controller_1.default.updateRockEvent.bind(event_controller_1.default));
        fastify.delete('/:id', event_controller_1.default.deleteRockEvent.bind(event_controller_1.default));
    });
}
