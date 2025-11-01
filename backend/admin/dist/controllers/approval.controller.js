"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalController = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class ApprovalController {
    // GET /api/approvals - Listar todas las aprobaciones
    async getAllApprovals(request, reply) {
        try {
            const { status, resourceType, companyId } = request.query;
            const where = {};
            if (status) {
                where.status = status;
            }
            if (resourceType) {
                where.resourceType = resourceType;
            }
            if (companyId) {
                where.companyId = companyId;
            }
            const approvals = await prisma.approval.findMany({
                where,
                include: {
                    company: {
                        select: {
                            id: true,
                            name: true,
                            type: true,
                            region: true,
                        },
                    },
                },
                orderBy: {
                    requestedAt: 'desc',
                },
            });
            return reply.status(200).send({
                success: true,
                approvals: approvals.map((approval) => ({
                    id: approval.id,
                    resourceType: approval.resourceType,
                    resourceId: approval.resourceId,
                    resourceName: approval.resourceName,
                    companyId: approval.companyId,
                    companyName: approval.companyName,
                    requestedBy: approval.requestedBy,
                    requestedAt: approval.requestedAt,
                    status: approval.status,
                    reviewedBy: approval.reviewedBy,
                    reviewedAt: approval.reviewedAt,
                    notes: approval.notes,
                    metadata: approval.metadata,
                    company: approval.company,
                })),
            });
        }
        catch (error) {
            console.error('Error fetching approvals:', error);
            return reply.status(500).send({
                success: false,
                message: 'Error al obtener las aprobaciones',
                error: error.message,
            });
        }
    }
    // GET /api/approvals/:id - Obtener una aprobación específica
    async getApprovalById(request, reply) {
        try {
            const { id } = request.params;
            const approval = await prisma.approval.findUnique({
                where: { id },
                include: {
                    company: true,
                },
            });
            if (!approval) {
                return reply.status(404).send({
                    success: false,
                    message: 'Aprobación no encontrada',
                });
            }
            return reply.status(200).send({
                success: true,
                approval,
            });
        }
        catch (error) {
            console.error('Error fetching approval:', error);
            return reply.status(500).send({
                success: false,
                message: 'Error al obtener la aprobación',
                error: error.message,
            });
        }
    }
    // POST /api/approvals - Crear una nueva solicitud de aprobación
    async createApproval(request, reply) {
        try {
            const { resourceType, resourceId, resourceName, companyId, companyName, requestedBy, metadata, } = request.body;
            // Verificar que la compañía existe
            const company = await prisma.company.findUnique({
                where: { id: companyId },
            });
            if (!company) {
                return reply.status(404).send({
                    success: false,
                    message: 'Compañía no encontrada',
                });
            }
            const approval = await prisma.approval.create({
                data: {
                    resourceType: resourceType,
                    resourceId,
                    resourceName,
                    companyId,
                    companyName,
                    requestedBy,
                    metadata,
                    status: 'PENDING',
                },
            });
            return reply.status(201).send({
                success: true,
                message: 'Solicitud de aprobación creada exitosamente',
                approval,
            });
        }
        catch (error) {
            console.error('Error creating approval:', error);
            return reply.status(500).send({
                success: false,
                message: 'Error al crear la solicitud de aprobación',
                error: error.message,
            });
        }
    }
    // PATCH /api/approvals/:id/approve - Aprobar una solicitud
    async approveRequest(request, reply) {
        try {
            const { id } = request.params;
            const { notes } = request.body;
            const user = request.user;
            const approval = await prisma.approval.findUnique({
                where: { id },
            });
            if (!approval) {
                return reply.status(404).send({
                    success: false,
                    message: 'Solicitud de aprobación no encontrada',
                });
            }
            if (approval.status !== 'PENDING') {
                return reply.status(400).send({
                    success: false,
                    message: 'Esta solicitud ya ha sido procesada',
                });
            }
            const updatedApproval = await prisma.approval.update({
                where: { id },
                data: {
                    status: 'APPROVED',
                    reviewedBy: user?.email || 'system',
                    reviewedAt: new Date(),
                    notes,
                },
            });
            // Actualizar el recurso en MongoDB a través de Festival Services
            try {
                const axios = require('axios');
                let endpoint = '';
                switch (updatedApproval.resourceType) {
                    case 'RESTAURANT':
                        endpoint = `http://localhost:3004/api/restaurant/${updatedApproval.resourceId}/approval-status`;
                        break;
                    case 'TRIP':
                        endpoint = `http://localhost:3004/api/travel/${updatedApproval.resourceId}/approval-status`;
                        break;
                    case 'PRODUCT':
                        endpoint = `http://localhost:3004/api/merchandising/${updatedApproval.resourceId}/approval-status`;
                        break;
                }
                if (endpoint) {
                    await axios.patch(endpoint, {
                        approvalStatus: 'APPROVED',
                        reviewedBy: user?.email || 'system',
                        reviewedAt: new Date(),
                    });
                    console.log(`[APPROVAL] Recurso ${updatedApproval.resourceType} actualizado en MongoDB`);
                }
            }
            catch (error) {
                console.error('[APPROVAL] Error actualizando recurso en MongoDB:', error.message);
                // No fallar la aprobación si falla la actualización en MongoDB
            }
            return reply.status(200).send({
                success: true,
                message: 'Solicitud aprobada exitosamente',
                approval: updatedApproval,
            });
        }
        catch (error) {
            console.error('Error approving request:', error);
            return reply.status(500).send({
                success: false,
                message: 'Error al aprobar la solicitud',
                error: error.message,
            });
        }
    }
    // PATCH /api/approvals/:id/reject - Rechazar una solicitud
    async rejectRequest(request, reply) {
        try {
            const { id } = request.params;
            const { reason } = request.body;
            const user = request.user;
            if (!reason) {
                return reply.status(400).send({
                    success: false,
                    message: 'El motivo del rechazo es obligatorio',
                });
            }
            const approval = await prisma.approval.findUnique({
                where: { id },
            });
            if (!approval) {
                return reply.status(404).send({
                    success: false,
                    message: 'Solicitud de aprobación no encontrada',
                });
            }
            if (approval.status !== 'PENDING') {
                return reply.status(400).send({
                    success: false,
                    message: 'Esta solicitud ya ha sido procesada',
                });
            }
            const updatedApproval = await prisma.approval.update({
                where: { id },
                data: {
                    status: 'REJECTED',
                    reviewedBy: user?.email || 'system',
                    reviewedAt: new Date(),
                    notes: reason,
                },
            });
            // Actualizar el recurso en MongoDB a través de Festival Services
            try {
                const axios = require('axios');
                let endpoint = '';
                switch (updatedApproval.resourceType) {
                    case 'RESTAURANT':
                        endpoint = `http://localhost:3004/api/restaurant/${updatedApproval.resourceId}/approval-status`;
                        break;
                    case 'TRIP':
                        endpoint = `http://localhost:3004/api/travel/${updatedApproval.resourceId}/approval-status`;
                        break;
                    case 'PRODUCT':
                        endpoint = `http://localhost:3004/api/merchandising/${updatedApproval.resourceId}/approval-status`;
                        break;
                }
                if (endpoint) {
                    await axios.patch(endpoint, {
                        approvalStatus: 'REJECTED',
                        reviewedBy: user?.email || 'system',
                        reviewedAt: new Date(),
                        rejectionReason: reason,
                    });
                    console.log(`[APPROVAL] Recurso ${updatedApproval.resourceType} rechazado en MongoDB`);
                }
            }
            catch (error) {
                console.error('[APPROVAL] Error actualizando recurso en MongoDB:', error.message);
                // No fallar el rechazo si falla la actualización en MongoDB
            }
            return reply.status(200).send({
                success: true,
                message: 'Solicitud rechazada',
                approval: updatedApproval,
            });
        }
        catch (error) {
            console.error('Error rejecting request:', error);
            return reply.status(500).send({
                success: false,
                message: 'Error al rechazar la solicitud',
                error: error.message,
            });
        }
    }
    // GET /api/approvals/stats - Obtener estadísticas de aprobaciones
    async getApprovalStats(request, reply) {
        try {
            const [pending, approved, rejected, total] = await Promise.all([
                prisma.approval.count({ where: { status: 'PENDING' } }),
                prisma.approval.count({ where: { status: 'APPROVED' } }),
                prisma.approval.count({ where: { status: 'REJECTED' } }),
                prisma.approval.count(),
            ]);
            const byResourceType = await prisma.approval.groupBy({
                by: ['resourceType'],
                _count: true,
            });
            return reply.status(200).send({
                success: true,
                stats: {
                    pending,
                    approved,
                    rejected,
                    total,
                    byResourceType: byResourceType.reduce((acc, item) => {
                        acc[item.resourceType] = item._count;
                        return acc;
                    }, {}),
                },
            });
        }
        catch (error) {
            console.error('Error fetching approval stats:', error);
            return reply.status(500).send({
                success: false,
                message: 'Error al obtener estadísticas',
                error: error.message,
            });
        }
    }
}
exports.ApprovalController = ApprovalController;
