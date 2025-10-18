"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRoutes = orderRoutes;
const order_controller_1 = __importDefault(require("../controllers/order.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function orderRoutes(fastify) {
    // ==================== RUTAS PRIVADAS (Requieren autenticación) ====================
    fastify.register(async (fastify) => {
        fastify.addHook('preHandler', auth_middleware_1.authMiddleware);
        // Crear orden
        fastify.post('/', {
            schema: {
                tags: ['Orders'],
                summary: 'Crear nueva orden',
                description: 'Crea una nueva orden de compra',
                security: [{ bearerAuth: [] }],
                body: {
                    type: 'object',
                    required: ['eventId', 'tickets'],
                    properties: {
                        eventId: { type: 'string', description: 'ID del evento' },
                        tickets: {
                            type: 'array',
                            items: {
                                type: 'object',
                                required: ['localityId', 'quantity'],
                                properties: {
                                    localityId: {
                                        type: 'string',
                                        description: 'ID de la localidad',
                                    },
                                    quantity: {
                                        type: 'integer',
                                        minimum: 1,
                                        description: 'Cantidad de tickets',
                                    },
                                    price: { type: 'number', description: 'Precio por ticket' },
                                },
                            },
                        },
                        customerInfo: {
                            type: 'object',
                            properties: {
                                name: { type: 'string' },
                                email: { type: 'string', format: 'email' },
                                phone: { type: 'string' },
                            },
                        },
                    },
                },
            },
        }, order_controller_1.default.createOrder.bind(order_controller_1.default));
        // Obtener mis órdenes
        fastify.get('/my-orders', {
            schema: {
                tags: ['Orders'],
                summary: 'Mis órdenes',
                description: 'Obtiene las órdenes del usuario autenticado',
                security: [{ bearerAuth: [] }],
                querystring: {
                    type: 'object',
                    properties: {
                        page: { type: 'integer', minimum: 1 },
                        limit: { type: 'integer', minimum: 1, maximum: 100 },
                        status: {
                            type: 'string',
                            enum: ['pending', 'confirmed', 'cancelled', 'completed'],
                        },
                    },
                },
            },
        }, order_controller_1.default.getMyOrders.bind(order_controller_1.default));
        // Obtener orden por ID
        fastify.get('/:id', {
            schema: {
                tags: ['Orders'],
                summary: 'Obtener orden por ID',
                description: 'Obtiene los detalles de una orden específica',
                security: [{ bearerAuth: [] }],
                params: {
                    type: 'object',
                    required: ['id'],
                    properties: {
                        id: { type: 'string', description: 'ID de la orden' },
                    },
                },
            },
        }, order_controller_1.default.getOrderById.bind(order_controller_1.default));
        // Listar todas las órdenes (solo admin)
        fastify.get('/', {
            schema: {
                tags: ['Orders'],
                summary: 'Listar todas las órdenes (admin)',
                description: 'Obtiene la lista de todas las órdenes del sistema',
                security: [{ bearerAuth: [] }],
                querystring: {
                    type: 'object',
                    properties: {
                        page: { type: 'integer', minimum: 1 },
                        limit: { type: 'integer', minimum: 1, maximum: 100 },
                        status: {
                            type: 'string',
                            enum: ['pending', 'confirmed', 'cancelled', 'completed'],
                        },
                        eventId: { type: 'string', description: 'Filtrar por evento' },
                        userId: { type: 'string', description: 'Filtrar por usuario' },
                        startDate: { type: 'string', format: 'date-time' },
                        endDate: { type: 'string', format: 'date-time' },
                    },
                },
            },
        }, order_controller_1.default.getAllOrders.bind(order_controller_1.default));
        // Actualizar estado de orden
        fastify.patch('/:id/status', {
            schema: {
                tags: ['Orders'],
                summary: 'Actualizar estado de orden',
                description: 'Actualiza el estado de una orden específica',
                security: [{ bearerAuth: [] }],
                params: {
                    type: 'object',
                    required: ['id'],
                    properties: {
                        id: { type: 'string', description: 'ID de la orden' },
                    },
                },
                body: {
                    type: 'object',
                    required: ['status'],
                    properties: {
                        status: {
                            type: 'string',
                            enum: ['pending', 'confirmed', 'cancelled', 'completed'],
                            description: 'Nuevo estado de la orden',
                        },
                        reason: { type: 'string', description: 'Razón del cambio de estado' },
                    },
                },
            },
        }, order_controller_1.default.updateOrderStatus.bind(order_controller_1.default));
        // Cancelar orden
        fastify.post('/:id/cancel', {
            schema: {
                tags: ['Orders'],
                summary: 'Cancelar orden',
                description: 'Cancela una orden específica',
                security: [{ bearerAuth: [] }],
                params: {
                    type: 'object',
                    required: ['id'],
                    properties: {
                        id: { type: 'string', description: 'ID de la orden' },
                    },
                },
                body: {
                    type: 'object',
                    properties: {
                        reason: { type: 'string', description: 'Razón de la cancelación' },
                    },
                },
            },
        }, async (request, reply) => {
            // Cancelar orden usando updateOrderStatus
            const { id } = request.params;
            const { reason } = request.body;
            // Crear request object para updateOrderStatus
            const updateRequest = {
                ...request,
                params: { id },
                body: {
                    status: 'CANCELLED',
                    reason: reason || 'Cancelada por administrador',
                },
            };
            return order_controller_1.default.updateOrderStatus(updateRequest, reply);
        });
        // Obtener estadísticas de órdenes
        fastify.get('/stats/summary', {
            schema: {
                tags: ['Orders'],
                summary: 'Estadísticas de órdenes',
                description: 'Obtiene estadísticas generales de las órdenes',
                security: [{ bearerAuth: [] }],
            },
        }, async (request, reply) => {
            // Implementar estadísticas de órdenes con datos reales
            const totalOrders = await prisma.order.count();
            const ordersByStatus = await prisma.order.groupBy({
                by: ['status'],
                _count: { id: true },
            });
            const totalRevenue = await prisma.order.aggregate({
                where: { status: 'COMPLETED' },
                _sum: { totalAmount: true },
            });
            const recentOrders = await prisma.order.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Últimos 30 días
                    },
                },
            });
            reply.send({
                success: true,
                stats: {
                    totalOrders,
                    ordersByStatus: ordersByStatus.reduce((acc, item) => {
                        acc[item.status] = item._count.id;
                        return acc;
                    }, {}),
                    totalRevenue: totalRevenue._sum?.totalAmount || 0,
                    recentOrders,
                },
            });
        });
    });
}
