import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una notificación (uso interno/admin)' })
  @ApiResponse({ status: 201, description: 'Notificación creada correctamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async createNotification(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.createNotification(createNotificationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener notificaciones del usuario' })
  @ApiResponse({ status: 200, description: 'Lista de notificaciones' })
  @ApiQuery({ name: 'category', required: false, type: String })
  async getNotifications(@Query('category') category: string, @Request() req: any) {
    const userId = req.user?.userId || 'test-user-id';
    return this.notificationService.getNotifications(userId, category);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Obtener contador de notificaciones no leídas' })
  @ApiResponse({ status: 200, description: 'Contador de no leídas' })
  async getUnreadCount(@Request() req: any) {
    const userId = req.user?.userId || 'test-user-id';
    return this.notificationService.getUnreadCount(userId);
  }

  @Patch(':notificationId/read')
  @ApiOperation({ summary: 'Marcar notificación como leída' })
  @ApiResponse({ status: 200, description: 'Notificación marcada como leída' })
  @ApiResponse({ status: 404, description: 'Notificación no encontrada' })
  async markAsRead(@Param('notificationId') notificationId: string, @Request() req: any) {
    const userId = req.user?.userId || 'test-user-id';
    return this.notificationService.markAsRead(notificationId, userId);
  }

  @Patch('mark-all-read')
  @ApiOperation({ summary: 'Marcar todas las notificaciones como leídas' })
  @ApiResponse({ status: 200, description: 'Todas las notificaciones marcadas como leídas' })
  async markAllAsRead(@Request() req: any) {
    const userId = req.user?.userId || 'test-user-id';
    return this.notificationService.markAllAsRead(userId);
  }

  @Delete(':notificationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar notificación' })
  @ApiResponse({ status: 204, description: 'Notificación eliminada' })
  @ApiResponse({ status: 404, description: 'Notificación no encontrada' })
  async deleteNotification(
    @Param('notificationId') notificationId: string,
    @Request() req: any,
  ) {
    const userId = req.user?.userId || 'test-user-id';
    return this.notificationService.deleteNotification(notificationId, userId);
  }
}
