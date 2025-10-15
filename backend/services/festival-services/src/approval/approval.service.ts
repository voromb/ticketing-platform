import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { ClientProxy, EventPattern, Payload } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApprovalDto } from './dto/create-approval.dto';
import { UpdateApprovalDto } from './dto/update-approval.dto';
import {
  ApprovalEventType,
  ApprovalResponseEvent,
} from '../rabbitmq/events/approval.events';

@Injectable()
export class ApprovalService {
  constructor(
    private prisma: PrismaService,
    @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
  ) {}

  async create(createApprovalDto: CreateApprovalDto) {
    console.log('[APPROVAL] Datos recibidos en create:', createApprovalDto);
    
    return this.prisma.approval.create({
      data: {
        ...createApprovalDto,
        status: 'pending',
      },
    });
  }

  async findAll(status?: string, entityType?: string) {
    return this.prisma.approval.findMany({
      where: {
        ...(status && { status }),
        ...(entityType && { entityType }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const approval = await this.prisma.approval.findUnique({
      where: { id },
    });

    if (!approval) {
      throw new NotFoundException(`Aprobación ${id} no encontrada`);
    }

    return approval;
  }

  async update(id: string, updateApprovalDto: UpdateApprovalDto) {
    await this.findOne(id);

    return this.prisma.approval.update({
      where: { id },
      data: updateApprovalDto,
    });
  }

  async approve(id: string, approvedBy: string, comments?: string) {
    const approval = await this.prisma.approval.update({
      where: { id },
      data: {
        status: 'approved',
        decidedBy: approvedBy,
        reason: comments,
        decidedAt: new Date(),
      },
    });

    // Publicar evento de aprobación
    const event: ApprovalResponseEvent = {
      type: ApprovalEventType.APPROVAL_GRANTED,
      data: {
        approvalId: approval.id,
        entityId: approval.entityId,
        entityType: approval.entityType,
        status: 'approved',
        approvedBy: approval.decidedBy || undefined,
        comments: approval.reason || undefined,
        approvedAt: approval.decidedAt || undefined,
      },
    };

    this.client.emit(ApprovalEventType.APPROVAL_GRANTED, event);
    console.log('[APPROVAL] Evento de aprobación publicado:', event);

    return approval;
  }

  async reject(id: string, rejectedBy: string, comments?: string) {
    const approval = await this.prisma.approval.update({
      where: { id },
      data: {
        status: 'rejected',
        decidedBy: rejectedBy,
        reason: comments,
        decidedAt: new Date(),
      },
    });

    // Publicar evento de rechazo
    const event: ApprovalResponseEvent = {
      type: ApprovalEventType.APPROVAL_REJECTED,
      data: {
        approvalId: approval.id,
        entityId: approval.entityId,
        entityType: approval.entityType,
        status: 'rejected',
        rejectedBy: approval.decidedBy || undefined,
        comments: approval.reason || undefined,
        rejectedAt: approval.decidedAt || undefined,
      },
    };

    this.client.emit(ApprovalEventType.APPROVAL_REJECTED, event);
    console.log('[APPROVAL] Evento de rechazo publicado:', event);

    return approval;
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.approval.delete({
      where: { id },
    });
  }

  // Métodos adicionales requeridos por el controller
  async findPending() {
    return this.prisma.approval.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStats() {
    const [total, pending, approved, rejected] = await Promise.all([
      this.prisma.approval.count(),
      this.prisma.approval.count({ where: { status: 'PENDING' } }),
      this.prisma.approval.count({ where: { status: 'APPROVED' } }),
      this.prisma.approval.count({ where: { status: 'REJECTED' } }),
    ]);

    return {
      total,
      pending,
      approved,
      rejected,
    };
  }

  async getByService(service: string) {
    return this.prisma.approval.findMany({
      where: { service: service.toUpperCase() },
      orderBy: { createdAt: 'desc' },
    });
  }

  async makeDecision(id: string, decisionDto: any) {
    const { status, decidedBy, reason } = decisionDto;
    
    if (status === 'APPROVED') {
      return this.approve(id, decidedBy, reason);
    } else if (status === 'REJECTED') {
      return this.reject(id, decidedBy, reason);
    }
    
    throw new Error('Decisión inválida. Debe ser "APPROVED" o "REJECTED"');
  }

  // ==================== RABBITMQ LISTENERS ====================

  @EventPattern('approval.requested')
  async handleApprovalRequested(@Payload() data: any): Promise<void> {
    console.log('📨 APPROVAL: Solicitud de aprobación recibida:', data);
    
    try {
      // Crear la solicitud de aprobación automáticamente
      const approvalData = {
        service: data.service,
        entityId: data.entityId,
        entityType: data.entityType,
        requestedBy: data.requestedBy,
        priority: data.priority,
        metadata: data.metadata,
      };

      const approval = await this.create(approvalData);
      
      console.log(
        '[APPROVAL] APPROVAL: Solicitud de aprobación creada automáticamente:',
        approval.id,
      );
    } catch (error) {
      console.error(
        '[APPROVAL] APPROVAL: Error al procesar solicitud de aprobación:',
        error,
      );
    }
  }
}