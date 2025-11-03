import { Injectable, OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from '../rabbitmq.service';
import { MessageService } from '../../message/message.service';
import { NotificationService } from '../../notification/notification.service';
import { SenderType } from '../../message/schemas/message.schema';
import {
  NotificationType,
  NotificationCategory,
  UserType,
} from '../../notification/schemas/notification.schema';

@Injectable()
export class ApprovalListener implements OnModuleInit {
  constructor(
    private rabbitMQService: RabbitMQService,
    private messageService: MessageService,
    private notificationService: NotificationService,
  ) {}

  async onModuleInit() {
    // Escuchar solicitud de aprobación
    await this.rabbitMQService.subscribeToEvent(
      'approval.requested',
      'messaging_approval_requested',
      this.handleApprovalRequested.bind(this),
    );

    // Escuchar aprobación concedida
    await this.rabbitMQService.subscribeToEvent(
      'approval.granted',
      'messaging_approval_granted',
      this.handleApprovalGranted.bind(this),
    );

    // Escuchar aprobación rechazada
    await this.rabbitMQService.subscribeToEvent(
      'approval.rejected',
      'messaging_approval_rejected',
      this.handleApprovalRejected.bind(this),
    );
  }

  /**
   * Manejar solicitud de aprobación - Notificar a SUPER_ADMIN
   */
  private async handleApprovalRequested(data: any) {
    try {
      const {
        approvalId,
        resourceType,
        resourceName,
        companyAdminId,
        companyAdminName,
        companyName,
        priority,
      } = data;

      const resourceTypeText = this.getResourceTypeText(resourceType);

      // Mensaje al SUPER_ADMIN
      const messageContent = `Nueva solicitud de aprobación pendiente 📋\n\n` +
        `Tipo: ${resourceTypeText}\n` +
        `Nombre: ${resourceName}\n` +
        `Empresa: ${companyName}\n` +
        `Solicitado por: ${companyAdminName}\n` +
        `Prioridad: ${priority}\n\n` +
        `Por favor, revisa y aprueba/rechaza esta solicitud.`;

      // Aquí deberías obtener el ID del SUPER_ADMIN desde tu base de datos
      // Por ahora usamos un placeholder
      const superAdminId = 'super-admin-id'; // TODO: Obtener del sistema

      await this.messageService.sendSystemMessage(
        superAdminId,
        SenderType.SUPER_ADMIN,
        messageContent,
        { approvalId, resourceType, resourceId: data.resourceId, actionType: 'APPROVAL' },
      );

      // Notificación al SUPER_ADMIN
      await this.notificationService.createNotification({
        userId: superAdminId,
        userType: UserType.SUPER_ADMIN,
        title: `Nueva solicitud: ${resourceTypeText}`,
        message: `${companyName} solicita aprobación para "${resourceName}"`,
        notificationType: NotificationType.INFO,
        category: NotificationCategory.APPROVAL,
        metadata: {
          approvalId,
          resourceType,
          resourceId: data.resourceId,
          actionUrl: `/admin/approvals/${approvalId}`,
        },
      });

      console.log(`✅ Notificación de aprobación enviada a SUPER_ADMIN para ${resourceType}`);
    } catch (error) {
      console.error('❌ Error procesando approval.requested:', error);
      throw error;
    }
  }

  /**
   * Manejar aprobación concedida - Notificar a COMPANY_ADMIN
   */
  private async handleApprovalGranted(data: any) {
    try {
      const { approvalId, resourceType, resourceName, companyAdminId, reviewedBy } = data;

      const resourceTypeText = this.getResourceTypeText(resourceType);

      // Mensaje al COMPANY_ADMIN
      const messageContent = `¡Felicidades! Tu solicitud ha sido aprobada ✅\n\n` +
        `Tipo: ${resourceTypeText}\n` +
        `Nombre: ${resourceName}\n` +
        `Aprobado por: ${reviewedBy}\n\n` +
        `Tu ${resourceTypeText.toLowerCase()} ya está disponible en el sistema.`;

      await this.messageService.sendSystemMessage(
        companyAdminId,
        SenderType.COMPANY_ADMIN,
        messageContent,
        { approvalId, resourceType, resourceId: data.resourceId, actionType: 'APPROVAL' },
      );

      // Notificación al COMPANY_ADMIN
      await this.notificationService.createNotification({
        userId: companyAdminId,
        userType: UserType.COMPANY_ADMIN,
        title: '¡Solicitud aprobada!',
        message: `Tu ${resourceTypeText.toLowerCase()} "${resourceName}" ha sido aprobado`,
        notificationType: NotificationType.SUCCESS,
        category: NotificationCategory.APPROVAL,
        metadata: { approvalId, resourceType, resourceId: data.resourceId },
      });

      console.log(`✅ Notificación de aprobación enviada a COMPANY_ADMIN ${companyAdminId}`);
    } catch (error) {
      console.error('❌ Error procesando approval.granted:', error);
      throw error;
    }
  }

  /**
   * Manejar aprobación rechazada - Notificar a COMPANY_ADMIN
   */
  private async handleApprovalRejected(data: any) {
    try {
      const {
        approvalId,
        resourceType,
        resourceName,
        companyAdminId,
        reviewedBy,
        rejectionReason,
      } = data;

      const resourceTypeText = this.getResourceTypeText(resourceType);

      // Mensaje al COMPANY_ADMIN
      const messageContent = `Tu solicitud ha sido rechazada ❌\n\n` +
        `Tipo: ${resourceTypeText}\n` +
        `Nombre: ${resourceName}\n` +
        `Revisado por: ${reviewedBy}\n` +
        `Razón: ${rejectionReason || 'No especificada'}\n\n` +
        `Por favor, revisa los comentarios y realiza los ajustes necesarios.`;

      await this.messageService.sendSystemMessage(
        companyAdminId,
        SenderType.COMPANY_ADMIN,
        messageContent,
        { approvalId, resourceType, resourceId: data.resourceId, actionType: 'REJECTION' },
      );

      // Notificación al COMPANY_ADMIN
      await this.notificationService.createNotification({
        userId: companyAdminId,
        userType: UserType.COMPANY_ADMIN,
        title: 'Solicitud rechazada',
        message: `Tu ${resourceTypeText.toLowerCase()} "${resourceName}" ha sido rechazado`,
        notificationType: NotificationType.ERROR,
        category: NotificationCategory.APPROVAL,
        metadata: {
          approvalId,
          resourceType,
          resourceId: data.resourceId,
          rejectionReason,
        },
      });

      console.log(`✅ Notificación de rechazo enviada a COMPANY_ADMIN ${companyAdminId}`);
    } catch (error) {
      console.error('❌ Error procesando approval.rejected:', error);
      throw error;
    }
  }

  /**
   * Obtener texto legible del tipo de recurso
   */
  private getResourceTypeText(resourceType: string): string {
    const types: Record<string, string> = {
      RESTAURANT: 'Restaurante',
      TRAVEL: 'Viaje',
      PRODUCT: 'Producto',
    };
    return types[resourceType] || resourceType;
  }
}
