"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.approvalRoutes = approvalRoutes;
const approval_controller_1 = require("../controllers/approval.controller");
const auth_middleware_1 = __importDefault(require("../middlewares/auth.middleware"));
async function approvalRoutes(fastify) {
    const approvalController = new approval_controller_1.ApprovalController();
    // GET /api/approvals - Listar todas las aprobaciones
    fastify.get('/', {
        preHandler: auth_middleware_1.default,
        handler: approvalController.getAllApprovals.bind(approvalController)
    });
    // GET /api/approvals/stats - Obtener estadísticas
    fastify.get('/stats', {
        preHandler: auth_middleware_1.default,
        handler: approvalController.getApprovalStats.bind(approvalController)
    });
    // GET /api/approvals/:id - Obtener una aprobación específica
    fastify.get('/:id', {
        preHandler: auth_middleware_1.default,
        handler: approvalController.getApprovalById.bind(approvalController)
    });
    // POST /api/approvals - Crear una nueva solicitud
    fastify.post('/', {
        preHandler: auth_middleware_1.default,
        handler: approvalController.createApproval.bind(approvalController)
    });
    // PATCH /api/approvals/:id/approve - Aprobar una solicitud
    fastify.patch('/:id/approve', {
        preHandler: auth_middleware_1.default,
        handler: approvalController.approveRequest.bind(approvalController)
    });
    // PATCH /api/approvals/:id/reject - Rechazar una solicitud
    fastify.patch('/:id/reject', {
        preHandler: auth_middleware_1.default,
        handler: approvalController.rejectRequest.bind(approvalController)
    });
}
