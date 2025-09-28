"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditRoutes = auditRoutes;
async function auditRoutes(fastify) {
    fastify.get('/', async (request, reply) => {
        return reply.send({
            message: 'Audit API working',
            logs: []
        });
    });
}
