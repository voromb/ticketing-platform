import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateApprovalDto } from './dto/create-approval.dto';
import { ApprovalDecisionDto } from './dto/approval-decision.dto';

@Injectable()
export class ApprovalService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(createApprovalDto: CreateApprovalDto) {
    return this.prisma.approval.create({
      data: {
        ...createApprovalDto,
        priority: createApprovalDto.priority || 'MEDIUM',
      },
    });
  }

  async findAll(status?: string) {
    const where = status ? { status } : {};
    return this.prisma.approval.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { requestedAt: 'asc' }],
    });
  }

  async findPending() {
    return this.prisma.approval.findMany({
      where: { status: 'PENDING' },
      orderBy: [{ priority: 'desc' }, { requestedAt: 'asc' }],
    });
  }

  async findOne(id: string) {
    const approval = await this.prisma.approval.findUnique({
      where: { id },
    });

    if (!approval) {
      throw new NotFoundException(`Aprobación con ID ${id} no encontrada`);
    }

    return approval;
  }

  async makeDecision(id: string, decisionDto: ApprovalDecisionDto) {
    const approval = await this.findOne(id);

    if (approval.status !== 'PENDING') {
      throw new Error('Esta aprobación ya fue procesada');
    }

    return this.prisma.approval.update({
      where: { id },
      data: {
        status: decisionDto.status,
        decidedBy: decisionDto.decidedBy,
        decidedAt: new Date(),
        reason: decisionDto.reason,
      },
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
      approvalRate: total > 0 ? (approved / (approved + rejected)) * 100 : 0,
    };
  }

  async getByService(service: string) {
    return this.prisma.approval.findMany({
      where: { service },
      orderBy: { requestedAt: 'desc' },
    });
  }
}
