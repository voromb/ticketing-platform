import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ApprovalService } from './approval.service';
import { CreateApprovalDto } from './dto/create-approval.dto';
import { ApprovalDecisionDto } from './dto/approval-decision.dto';

@ApiTags('approval')
@Controller('approval')
export class ApprovalController {
  constructor(private readonly approvalService: ApprovalService) {}

  @Post()
  @ApiOperation({ summary: 'Crear solicitud de aprobación' })
  @ApiResponse({ status: 201, description: 'Solicitud creada exitosamente' })
  create(@Body() createApprovalDto: CreateApprovalDto) {
    return this.approvalService.create(createApprovalDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las aprobaciones' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
  })
  @ApiResponse({ status: 200, description: 'Lista de aprobaciones' })
  findAll(@Query('status') status?: string) {
    return this.approvalService.findAll(status);
  }

  @Get('pending')
  @ApiOperation({ summary: 'Obtener aprobaciones pendientes' })
  @ApiResponse({ status: 200, description: 'Lista de aprobaciones pendientes' })
  findPending() {
    return this.approvalService.findPending();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas de aprobaciones' })
  @ApiResponse({ status: 200, description: 'Estadísticas' })
  getStats() {
    return this.approvalService.getStats();
  }

  @Get('service/:service')
  @ApiOperation({ summary: 'Obtener aprobaciones por servicio' })
  @ApiResponse({
    status: 200,
    description: 'Lista de aprobaciones del servicio',
  })
  getByService(@Param('service') service: string) {
    return this.approvalService.getByService(service);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una aprobación por ID' })
  @ApiResponse({ status: 200, description: 'Aprobación encontrada' })
  @ApiResponse({ status: 404, description: 'Aprobación no encontrada' })
  findOne(@Param('id') id: string) {
    return this.approvalService.findOne(id);
  }

  @Patch(':id/decision')
  @ApiOperation({ summary: 'Aprobar o rechazar solicitud' })
  @ApiResponse({ status: 200, description: 'Decisión registrada' })
  makeDecision(
    @Param('id') id: string,
    @Body() decisionDto: ApprovalDecisionDto,
  ) {
    return this.approvalService.makeDecision(id, decisionDto);
  }
}
