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
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { GetMessagesDto } from './dto/get-messages.dto';

@ApiTags('messages')
@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post('send')
  @ApiOperation({ summary: 'Enviar un mensaje manual' })
  @ApiResponse({ status: 201, description: 'Mensaje enviado correctamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async sendMessage(@Body() createMessageDto: CreateMessageDto, @Request() req: any) {
    // TODO: Extraer del JWT cuando implementemos autenticación
    const senderId = req.user?.userId || 'test-user-id';
    const senderType = req.user?.userType || 'USER';
    const senderName = req.user?.userName || 'Usuario Test';

    return this.messageService.sendMessage(
      createMessageDto,
      senderId,
      senderType,
      senderName,
    );
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Obtener todas las conversaciones del usuario' })
  @ApiResponse({ status: 200, description: 'Lista de conversaciones' })
  async getConversations(@Request() req: any) {
    const userId = req.user?.userId || 'test-user-id';
    return this.messageService.getConversations(userId);
  }

  @Get('conversations/:conversationId')
  @ApiOperation({ summary: 'Obtener mensajes de una conversación' })
  @ApiResponse({ status: 200, description: 'Mensajes de la conversación' })
  @ApiResponse({ status: 404, description: 'Conversación no encontrada' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getMessages(
    @Param('conversationId') conversationId: string,
    @Query() query: GetMessagesDto,
    @Request() req: any,
  ) {
    const userId = req.user?.userId || 'test-user-id';
    return this.messageService.getMessages(conversationId, userId, query);
  }

  @Patch(':messageId/read')
  @ApiOperation({ summary: 'Marcar mensaje como leído' })
  @ApiResponse({ status: 200, description: 'Mensaje marcado como leído' })
  @ApiResponse({ status: 404, description: 'Mensaje no encontrado' })
  async markAsRead(@Param('messageId') messageId: string, @Request() req: any) {
    const userId = req.user?.userId || 'test-user-id';
    return this.messageService.markAsRead(messageId, userId);
  }

  @Patch('conversations/:conversationId/read-all')
  @ApiOperation({ summary: 'Marcar toda la conversación como leída' })
  @ApiResponse({ status: 200, description: 'Conversación marcada como leída' })
  @ApiResponse({ status: 404, description: 'Conversación no encontrada' })
  async markConversationAsRead(
    @Param('conversationId') conversationId: string,
    @Request() req: any,
  ) {
    const userId = req.user?.userId || 'test-user-id';
    return this.messageService.markConversationAsRead(conversationId, userId);
  }

  @Delete('conversations/:conversationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar conversación (soft delete)' })
  @ApiResponse({ status: 204, description: 'Conversación eliminada' })
  @ApiResponse({ status: 404, description: 'Conversación no encontrada' })
  async deleteConversation(
    @Param('conversationId') conversationId: string,
    @Request() req: any,
  ) {
    const userId = req.user?.userId || 'test-user-id';
    return this.messageService.deleteConversation(conversationId, userId);
  }
}
