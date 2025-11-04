import { Controller } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { MessageService } from './message.service';
import axios from 'axios';

@Controller()
export class ApprovalMessageListener {
  constructor(private readonly messageService: MessageService) {
    console.log('✅ ApprovalMessageListener iniciado');
  }

  /**
   * Cuando se solicita una aprobación, enviar mensaje al SUPER_ADMIN
   */
  @EventPattern('approval.requested')
  async handleApprovalRequested(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log('📨 [ApprovalMessageListener] Evento recibido: approval.requested');
    console.log('📋 Datos del evento:', JSON.stringify(data, null, 2));
    
    // Acknowledge del mensaje
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    channel.ack(originalMsg);
    
    console.log('🔔 Enviando mensaje de solicitud de aprobación al SUPER_ADMIN');

    const { resourceType, resourceName, requestedBy, requestedByName, approvalId, metadata } = data;

    // Obtener el SUPER_ADMIN (asumimos que hay uno con un ID conocido o lo buscamos)
    // Por ahora usaremos un ID fijo, pero deberías obtenerlo de la base de datos
    const superAdminId = await this.getSuperAdminId();

    if (!superAdminId) {
      console.warn('⚠️ No se encontró SUPER_ADMIN para enviar el mensaje');
      return;
    }

    const messageContent = this.buildApprovalRequestMessage(resourceType, resourceName, requestedByName, metadata);

    try {
      await this.messageService.sendDetailedSystemMessage({
        recipientId: superAdminId,
        recipientType: 'SUPER_ADMIN',
        recipientName: 'Super Admin',
        senderId: 'SYSTEM',
        senderType: 'SYSTEM',
        senderName: 'Sistema de Aprobaciones',
        content: messageContent,
        subject: `Nueva solicitud de aprobación: ${resourceType}`,
        messageType: 'APPROVAL_REQUEST',
        metadata: {
          approvalId,
          resourceType,
          resourceName,
          requestedBy,
          requestedByName,
        },
      });

      console.log('✅ Mensaje de solicitud enviado al SUPER_ADMIN');
    } catch (error) {
      console.error('❌ Error enviando mensaje de solicitud:', error);
    }
  }

  /**
   * Cuando se aprueba, enviar mensaje al COMPANY_ADMIN
   */
  @EventPattern('approval.granted')
  async handleApprovalGranted(@Payload() data: any) {
    console.log('✅ Enviando mensaje de aprobación al COMPANY_ADMIN');

    const { resourceType, resourceName, approvedBy, approvedByName, requestedBy, requestedByName } = data;

    const icon = this.getResourceIcon(resourceType);
    const typeLabel = this.getResourceTypeLabel(resourceType);
    
    const messageContent = `✅ SOLICITUD APROBADA\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `${icon} ${typeLabel}: ${resourceName}\n` +
      `👤 Aprobado por: ${approvedByName}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🎉 ¡Felicidades! Tu recurso ya está disponible y activo en el sistema.`;

    try {
      await this.messageService.sendDetailedSystemMessage({
        recipientId: requestedBy,
        recipientType: 'COMPANY_ADMIN',
        recipientName: requestedByName,
        senderId: 'SYSTEM',
        senderType: 'SYSTEM',
        senderName: 'Sistema de Aprobaciones',
        content: messageContent,
        subject: `Solicitud aprobada: ${resourceType}`,
        messageType: 'APPROVAL_GRANTED',
        metadata: {
          resourceType,
          resourceName,
          approvedBy,
          approvedByName,
        },
      });

      console.log('✅ Mensaje de aprobación enviado al COMPANY_ADMIN');
    } catch (error) {
      console.error('❌ Error enviando mensaje de aprobación:', error);
    }
  }

  /**
   * Cuando se rechaza, enviar mensaje al COMPANY_ADMIN
   */
  @EventPattern('approval.rejected')
  async handleApprovalRejected(@Payload() data: any) {
    console.log('❌ Enviando mensaje de rechazo al COMPANY_ADMIN');

    const { resourceType, resourceName, rejectedBy, rejectedByName, requestedBy, requestedByName, reason } = data;

    const icon = this.getResourceIcon(resourceType);
    const typeLabel = this.getResourceTypeLabel(resourceType);
    
    const messageContent = `❌ SOLICITUD RECHAZADA\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `${icon} ${typeLabel}: ${resourceName}\n` +
      `👤 Rechazado por: ${rejectedByName}\n` +
      `💬 Motivo: ${reason || 'No se especificó un motivo'}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📝 Por favor, revisa los detalles y vuelve a intentarlo.`;

    try {
      await this.messageService.sendDetailedSystemMessage({
        recipientId: requestedBy,
        recipientType: 'COMPANY_ADMIN',
        recipientName: requestedByName,
        senderId: 'SYSTEM',
        senderType: 'SYSTEM',
        senderName: 'Sistema de Aprobaciones',
        content: messageContent,
        subject: `Solicitud rechazada: ${resourceType}`,
        messageType: 'APPROVAL_REJECTED',
        metadata: {
          resourceType,
          resourceName,
          rejectedBy,
          rejectedByName,
          reason,
        },
      });

      console.log('✅ Mensaje de rechazo enviado al COMPANY_ADMIN');
    } catch (error) {
      console.error('❌ Error enviando mensaje de rechazo:', error);
    }
  }

  /**
   * Construir mensaje de solicitud de aprobación
   */
  private buildApprovalRequestMessage(resourceType: string, resourceName: string, requestedByName: string, metadata: any): string {
    const typeLabel = this.getResourceTypeLabel(resourceType);
    const icon = this.getResourceIcon(resourceType);
    
    let message = `${icon} NUEVA SOLICITUD DE APROBACIÓN\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `📋 Tipo: ${typeLabel}\n`;
    message += `🏷️ Nombre: ${resourceName}\n`;
    message += `👤 Solicitado por: ${requestedByName}\n`;
    
    if (metadata?.region) {
      message += `🌍 Región: ${metadata.region}\n`;
    }

    // Agregar detalles específicos según el tipo de recurso
    if (metadata) {
      message += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      
      if (resourceType === 'PRODUCT') {
        message += `💰 Precio: ${metadata.price || 'N/A'}€\n`;
        if (metadata.stock?.total) {
          message += `📦 Stock: ${metadata.stock.total} unidades\n`;
        }
      } else if (resourceType === 'TRIP') {
        message += `🚌 Capacidad: ${metadata.capacity || 'N/A'} personas\n`;
        if (metadata.vehicleType) {
          message += `🚗 Tipo de vehículo: ${metadata.vehicleType}\n`;
        }
      } else if (resourceType === 'RESTAURANT') {
        message += `🪑 Capacidad: ${metadata.capacity || 'N/A'} personas\n`;
        if (metadata.cuisine) {
          message += `🍽️ Cocina: ${metadata.cuisine}\n`;
        }
      }
    }

    message += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `⚠️ Por favor, revisa y aprueba o rechaza esta solicitud en el panel de aprobaciones.`;

    return message;
  }

  /**
   * Obtener icono según el tipo de recurso
   */
  private getResourceIcon(resourceType: string): string {
    const icons = {
      RESTAURANT: '🍽️',
      TRIP: '✈️',
      PRODUCT: '🛍️',
    };
    return icons[resourceType] || '📦';
  }

  /**
   * Obtener label del tipo de recurso
   */
  private getResourceTypeLabel(resourceType: string): string {
    const labels = {
      RESTAURANT: 'Restaurante',
      TRIP: 'Viaje',
      PRODUCT: 'Producto',
    };
    return labels[resourceType] || resourceType;
  }

  /**
   * Obtener ID del SUPER_ADMIN desde el servicio de admin
   */
  private async getSuperAdminId(): Promise<string | null> {
    try {
      // Primero intentamos hacer login como SUPER_ADMIN para obtener el token
      const loginResponse = await axios.post('http://localhost:3003/api/auth/login', {
        email: 'voro.super@ticketing.com',
        password: 'Voro123!'
      });

      const token = loginResponse.data.token;
      
      // Luego obtenemos el perfil del usuario autenticado
      const profileResponse = await axios.get('http://localhost:3003/api/admins/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const superAdminId = profileResponse.data.admin?.id;
      
      if (superAdminId) {
        console.log(`✅ SUPER_ADMIN ID obtenido: ${superAdminId}`);
        return superAdminId;
      }
      
      console.warn('⚠️ No se pudo obtener el ID del SUPER_ADMIN del perfil');
      return null;
    } catch (error: any) {
      console.error('❌ Error obteniendo ID del SUPER_ADMIN:', error.message);
      // Fallback al ID hardcodeado si falla la búsqueda
      return '26fa8809-a1a4-4242-9d09-42e65e5ee368';
    }
  }
}
