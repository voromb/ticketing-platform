"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messagingUsersRoutes = messagingUsersRoutes;
const messaging_users_controller_1 = require("../controllers/messaging-users.controller");
async function messagingUsersRoutes(fastify) {
    const controller = new messaging_users_controller_1.MessagingUsersController();
    // NOTA: Estas rutas NO requieren autenticación para permitir que cualquier usuario
    // pueda ver la lista de destinatarios disponibles para enviar mensajes
    // GET /api/messaging-users/admins - Lista de Super Admins y Admins
    fastify.get('/admins', {
        schema: {
            tags: ['Messaging Users'],
            summary: 'Lista de administradores para mensajería',
            description: 'Obtiene una lista simplificada de administradores para el sistema de mensajería (sin autenticación requerida)'
        }
    }, controller.getAdminsForMessaging.bind(controller));
    // GET /api/messaging-users/company-admins - Lista de Company Admins
    fastify.get('/company-admins', {
        schema: {
            tags: ['Messaging Users'],
            summary: 'Lista de gestores de servicios para mensajería',
            description: 'Obtiene una lista simplificada de gestores de servicios para el sistema de mensajería (sin autenticación requerida)'
        }
    }, controller.getCompanyAdminsForMessaging.bind(controller));
    // GET /api/messaging-users/all-admins - Todos los tipos de admins
    fastify.get('/all-admins', {
        schema: {
            tags: ['Messaging Users'],
            summary: 'Lista de todos los administradores para mensajería',
            description: 'Obtiene una lista combinada de todos los tipos de administradores para el sistema de mensajería (sin autenticación requerida)'
        }
    }, controller.getAllAdminsForMessaging.bind(controller));
}
