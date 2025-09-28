"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.venueRoutes = venueRoutes;
const venue_controller_1 = require("../controllers/venue.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const venueController = new venue_controller_1.VenueController({
    publishEvent: () => Promise.resolve(),
    isConnected: () => false,
    connect: () => Promise.resolve(),
    close: () => Promise.resolve()
});
async function venueRoutes(fastify) {
    fastify.get('/', venueController.getAll.bind(venueController));
    fastify.get('/:id', venueController.getById.bind(venueController));
    fastify.post('/', {
        preHandler: auth_middleware_1.authMiddleware
    }, venueController.create.bind(venueController));
    fastify.put('/:id', {
        preHandler: auth_middleware_1.authMiddleware
    }, venueController.update.bind(venueController));
    fastify.patch('/:id', {
        preHandler: auth_middleware_1.authMiddleware
    }, venueController.update.bind(venueController));
    fastify.delete('/:id', {
        preHandler: auth_middleware_1.authMiddleware
    }, venueController.delete.bind(venueController));
}
