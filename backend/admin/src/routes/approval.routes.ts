import { FastifyInstance } from 'fastify';
import { ApprovalController } from '../controllers/approval.controller';
import authenticateToken from '../middlewares/auth.middleware';

export async function approvalRoutes(fastify: FastifyInstance) {
  const approvalController = new ApprovalController();

  // GET /api/approvals - Listar todas las aprobaciones
  fastify.get('/', {
    preHandler: authenticateToken,
    handler: approvalController.getAllApprovals.bind(approvalController)
  });

  // GET /api/approvals/stats - Obtener estadísticas
  fastify.get('/stats', {
    preHandler: authenticateToken,
    handler: approvalController.getApprovalStats.bind(approvalController)
  });

  // GET /api/approvals/:id - Obtener una aprobación específica
  fastify.get('/:id', {
    preHandler: authenticateToken,
    handler: approvalController.getApprovalById.bind(approvalController)
  });

  // POST /api/approvals - Crear una nueva solicitud
  fastify.post('/', {
    preHandler: authenticateToken,
    handler: approvalController.createApproval.bind(approvalController)
  });

  // PATCH /api/approvals/:id/approve - Aprobar una solicitud
  fastify.patch('/:id/approve', {
    preHandler: authenticateToken,
    handler: approvalController.approveRequest.bind(approvalController)
  });

  // PATCH /api/approvals/:id/reject - Rechazar una solicitud
  fastify.patch('/:id/reject', {
    preHandler: authenticateToken,
    handler: approvalController.rejectRequest.bind(approvalController)
  });
}
