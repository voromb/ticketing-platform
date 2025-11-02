import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MessagingService, Conversation, Message, SendMessageDto } from '../../../services/messaging.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messages.html',
  styleUrl: './messages.css'
})
export class MessagesComponent implements OnInit, OnDestroy {
  conversations: Conversation[] = [];
  selectedConversation: Conversation | null = null;
  messages: Message[] = [];
  newMessage: string = '';
  loading: boolean = false;
  loadingMessages: boolean = false;
  unreadCount: number = 0;
  showNewMessageModal: boolean = false;
  hasShownUnreadAlert: boolean = false; // Para mostrar la alerta solo una vez
  
  // Formulario para nuevo mensaje
  newMessageForm = {
    recipientType: '',
    recipientId: '',
    recipientName: '',
    content: ''
  };
  
  // Lista de usuarios disponibles según el tipo seleccionado
  availableUsers: any[] = [];
  loadingUsers: boolean = false;
  
  // Usuario actual (debería venir del servicio de autenticación)
  currentUser = {
    id: localStorage.getItem('userId') || '',
    name: localStorage.getItem('userName') || 'Usuario',
    type: localStorage.getItem('userType') || 'USER'
  };

  private subscriptions: Subscription[] = [];
  private messagePollingInterval: any;

  constructor(
    private messagingService: MessagingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Suscribirse al contador de mensajes no leídos
    const countSub = this.messagingService.getUnreadMessagesCount().subscribe({
      next: (count) => {
        this.unreadCount = count;
        // NO mostrar alerta aquí, solo actualizar el contador
        // La alerta se muestra en login.component.ts
      },
      error: (error) => {
        console.warn('⚠️ No se pudo obtener el contador de mensajes no leídos');
        this.unreadCount = 0;
      }
    });
    this.subscriptions.push(countSub);

    // Cargar conversaciones
    this.loadConversations();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadConversations(): void {
    console.log('🔄 Iniciando carga de conversaciones... loading =', this.loading);
    this.loading = true;
    console.log('🔄 Loading activado, loading =', this.loading);
    
    this.messagingService.getConversations().subscribe({
      next: (conversations) => {
        console.log('✅ Conversaciones cargadas:', conversations);
        console.log('📊 Número de conversaciones:', conversations?.length);
        
        // Verificar que cada conversación tenga ID
        if (conversations && conversations.length > 0) {
          conversations.forEach((conv, index) => {
            const convId = conv._id || conv.id || conv.conversationId;
            console.log(`Conversación ${index}:`, {
              _id: conv._id,
              id: conv.id,
              conversationId: conv.conversationId,
              finalId: convId,
              participants: conv.participants?.length,
              hasLastMessage: !!conv.lastMessage
            });
            
            // Si no tiene ningún ID, mostrar advertencia
            if (!convId) {
              console.warn(`⚠️ Conversación ${index} no tiene ID:`, conv);
            }
          });
        }
        
        this.conversations = conversations || [];
        console.log('✅ Desactivando loading... loading =', this.loading);
        this.loading = false;
        this.cdr.detectChanges(); // Forzar detección de cambios
        console.log('✅ Loading desactivado, loading =', this.loading);
      },
      error: (error) => {
        console.error('❌ Error loading conversations:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        
        // Asegurarse de que el loading se detenga SIEMPRE
        console.log('❌ Desactivando loading por error... loading =', this.loading);
        this.loading = false;
        this.cdr.detectChanges(); // Forzar detección de cambios
        console.log('❌ Loading desactivado, loading =', this.loading);
        this.conversations = [];
        
        // Mostrar mensaje solo si es un error grave
        if (error.status === 0) {
          console.warn('⚠️ Servicio de mensajería no disponible. Mostrando vista vacía.');
        } else if (error.status === 401) {
          console.warn('⚠️ No autenticado. Usuario debe iniciar sesión.');
        }
      }
    });
  }

  selectConversation(conversation: Conversation): void {
    console.log('📋 Conversación seleccionada:', conversation);
    
    // Obtener el ID de la conversación (puede venir como _id, id o conversationId)
    const conversationId = conversation._id || conversation.id || conversation.conversationId;
    
    // Validar que la conversación tenga ID
    if (!conversationId) {
      console.error('❌ La conversación no tiene ID:', conversation);
      alert('Error: La conversación no tiene un ID válido');
      return;
    }
    
    console.log('🆔 ID de conversación:', conversationId);
    
    this.selectedConversation = conversation;
    this.loadMessages(conversationId);
    
    // Marcar conversación como leída
    if (conversation.unreadCount > 0) {
      this.messagingService.markConversationAsRead(conversationId).subscribe({
        next: () => {
          conversation.unreadCount = 0;
          this.messagingService.refreshUnreadCounts();
        },
        error: (error) => {
          console.error('❌ Error marcando conversación como leída:', error);
        }
      });
    }
  }

  loadMessages(conversationId: string): void {
    this.loadingMessages = true;
    console.log('🔄 Cargando mensajes de conversación:', conversationId);
    
    this.messagingService.getConversationMessages(conversationId).subscribe({
      next: (response) => {
        console.log('✅ Mensajes cargados:', response);
        console.log('📦 Estructura de response:', {
          hasData: !!response.data,
          hasMessages: !!response.messages,
          dataType: typeof response.data,
          messagesType: typeof response.messages,
          dataLength: response.data?.length,
          messagesLength: response.messages?.length
        });
        
        // El backend puede devolver response.data o response.messages
        this.messages = response.messages || response.data || [];
        console.log('📝 Mensajes asignados:', this.messages);
        
        // Debug: Ver estructura de cada mensaje
        if (this.messages.length > 0) {
          console.log('🔍 Primer mensaje:', this.messages[0]);
          console.log('🔍 Campos del mensaje:', Object.keys(this.messages[0]));
          console.log('🔍 senderName exacto:', JSON.stringify(this.messages[0].senderName));
          console.log('🔍 Tipo de senderName:', typeof this.messages[0].senderName);
        }
        
        this.loadingMessages = false;
        this.cdr.detectChanges(); // Forzar detección de cambios
        // Scroll al final
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (error) => {
        console.error('❌ Error loading messages:', error);
        // Asegurarse de que el loading se detenga SIEMPRE
        this.loadingMessages = false;
        this.cdr.detectChanges(); // Forzar detección de cambios
        this.messages = [];
      }
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedConversation) return;

    const otherParticipant = this.selectedConversation.participants.find(
      p => p.userId !== this.currentUser.id
    );

    if (!otherParticipant) return;

    // El backend obtiene senderId, senderType y senderName del JWT/request
    const messageDto: SendMessageDto = {
      recipientId: otherParticipant.userId,
      recipientType: otherParticipant.userType as any,
      recipientName: otherParticipant.userName,
      content: this.newMessage.trim()
    };

    this.messagingService.sendMessage(messageDto).subscribe({
      next: (response) => {
        console.log('✅ Mensaje enviado, response completo:', response);
        
        // El backend devuelve { success, message, data }
        // Necesitamos extraer el mensaje real de response.data
        const newMessage = response.data || response;
        console.log('📝 Mensaje extraído:', newMessage);
        
        // Agregar mensaje a la lista
        this.messages.push(newMessage);
        this.newMessage = '';
        
        // Forzar detección de cambios para que Angular actualice la vista
        this.cdr.detectChanges();
        
        // Scroll al final después de que se renderice el mensaje
        setTimeout(() => this.scrollToBottom(), 100);
        
        // Actualizar última mensaje en la conversación
        if (this.selectedConversation) {
          this.selectedConversation.lastMessage = {
            content: newMessage.content,
            senderId: newMessage.senderId,
            senderName: newMessage.senderName,
            createdAt: newMessage.createdAt
          };
        }
      },
      error: (error) => {
        console.error('❌ Error sending message:', error);
        alert('Error al enviar el mensaje. Por favor, intenta de nuevo.');
      }
    });
  }

  deleteConversation(conversation: Conversation, event: Event): void {
    event.stopPropagation();
    
    // Obtener el ID de la conversación (puede venir como _id, id o conversationId)
    const conversationId = conversation._id || conversation.id || conversation.conversationId;
    
    if (!conversationId) {
      console.error('❌ La conversación no tiene ID:', conversation);
      alert('Error: No se puede eliminar la conversación porque no tiene un ID válido');
      return;
    }
    
    // Usar SweetAlert en lugar de confirm nativo
    Swal.fire({
      title: '¿Eliminar conversación?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        console.log('🗑️ Eliminando conversación:', conversationId);
        
        this.messagingService.deleteConversation(conversationId).subscribe({
          next: () => {
            console.log('✅ Conversación eliminada');
            
            // Eliminar de la lista
            this.conversations = this.conversations.filter(c => {
              const cId = c._id || c.id || c.conversationId;
              return cId !== conversationId;
            });
            
            // Si era la conversación seleccionada, limpiar
            const selectedId = this.selectedConversation?._id || this.selectedConversation?.id || this.selectedConversation?.conversationId;
            if (selectedId === conversationId) {
              this.selectedConversation = null;
              this.messages = [];
            }
            
            // Actualizar contadores
            this.messagingService.refreshUnreadCounts();
            
            // Mostrar mensaje de éxito
            Swal.fire({
              title: '¡Eliminada!',
              text: 'La conversación ha sido eliminada',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          },
          error: (error) => {
            console.error('❌ Error eliminando conversación:', error);
            Swal.fire({
              title: 'Error',
              text: 'No se pudo eliminar la conversación. Intenta de nuevo.',
              icon: 'error',
              confirmButtonColor: '#007bff'
            });
          }
        });
      }
    });
  }

  isMyMessage(message: Message): boolean {
    return message.senderId === this.currentUser.id;
  }

  getOtherParticipantName(conversation: Conversation): string {
    const other = conversation.participants.find(p => p.userId !== this.currentUser.id);
    return other?.userName || 'Usuario';
  }

  getTimeAgo(date: Date | undefined): string {
    if (!date) return '';
    const now = new Date();
    const messageDate = new Date(date);
    const diffMs = now.getTime() - messageDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours}h`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `Hace ${diffDays}d`;
  }

  formatMessageTime(date: Date | undefined): string {
    if (!date) return '';
    const messageDate = new Date(date);
    return messageDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }

  cleanSenderName(senderName: string | undefined): string {
    if (!senderName) return 'Usuario';
    // Eliminar 'undefined' del nombre si existe
    return senderName.replace(/\s*undefined\s*/gi, '').trim() || 'Usuario';
  }

  private scrollToBottom(): void {
    const messagesContainer = document.querySelector('.messages-container');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  isAdmin(): boolean {
    const userRole = this.currentUser.type.toUpperCase();
    return userRole === 'ADMIN' || userRole === 'SUPER_ADMIN' || userRole === 'COMPANY_ADMIN';
  }

  getTypeLabel(type: string): string {
    switch(type) {
      case 'USER': return 'Usuarios / VIP';
      case 'SUPER_ADMIN': return 'Super Admins';
      case 'COMPANY_ADMIN': return 'Gestores de Servicios';
      default: return 'usuarios';
    }
  }

  // Métodos para el modal de nuevo mensaje
  onRecipientTypeChange(): void {
    // Limpiar campos cuando cambia el tipo
    this.newMessageForm.recipientId = '';
    this.newMessageForm.recipientName = '';
    this.availableUsers = [];
    
    // Cargar usuarios del tipo seleccionado
    if (this.newMessageForm.recipientType) {
      this.loadingUsers = true;
      console.log('Cargando usuarios del tipo:', this.newMessageForm.recipientType);
      
      // Timeout de seguridad para el loading de usuarios
      const timeoutId = setTimeout(() => {
        if (this.loadingUsers) {
          console.warn('⚠️ Timeout: Deteniendo carga de usuarios');
          this.loadingUsers = false;
          this.availableUsers = [];
          alert('⚠️ Timeout al cargar usuarios. Por favor, verifica que los servicios estén corriendo.');
        }
      }, 10000); // 10 segundos
      
      this.messagingService.getUsersByType(this.newMessageForm.recipientType).subscribe({
        next: (users) => {
          clearTimeout(timeoutId); // Cancelar timeout si la petición fue exitosa
          console.log('Usuarios cargados:', users);
          this.availableUsers = users || [];
          this.loadingUsers = false;
        },
        error: (error) => {
          clearTimeout(timeoutId); // Cancelar timeout si hubo error
          console.error('Error loading users:', error);
          this.loadingUsers = false;
          this.availableUsers = [];
          
          // Mensaje específico según el error
          if (error.status === 403) {
            alert(`⚠️ No tienes permisos para ver la lista de ${this.getTypeLabel(this.newMessageForm.recipientType)}.\n\nPuedes:\n- Seleccionar "Usuario / VIP" para ver usuarios normales\n- O contactar con un administrador`);
          } else if (error.status === 401) {
            alert('❌ Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.');
          } else if (error.status === 0) {
            alert('❌ No se pudo conectar con el servidor. Verifica que los servicios estén corriendo.');
          } else {
            alert(`Error al cargar usuarios: ${error.error?.error || error.message || 'Error desconocido'}`);
          }
        }
      });
    }
  }
  
  onUserSelect(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const userId = selectElement.value;
    
    if (userId) {
      const selectedUser = this.availableUsers.find(u => u._id === userId || u.id === userId);
      if (selectedUser) {
        this.newMessageForm.recipientId = selectedUser._id || selectedUser.id;
        this.newMessageForm.recipientName = selectedUser.firstName || selectedUser.name || selectedUser.email;
      }
    }
  }

  isNewMessageFormValid(): boolean {
    return !!(
      this.newMessageForm.recipientType &&
      this.newMessageForm.recipientId &&
      this.newMessageForm.recipientName &&
      this.newMessageForm.content.trim()
    );
  }

  sendNewMessage(): void {
    if (!this.isNewMessageFormValid()) {
      alert('Por favor, completa todos los campos del formulario');
      return;
    }

    console.log('=== ENVIANDO MENSAJE ===');
    console.log('Current User:', this.currentUser);
    console.log('Form Data:', this.newMessageForm);

    // El backend obtiene senderId, senderType y senderName del JWT/request
    // Solo enviamos los datos del destinatario y el contenido
    const messageDto: SendMessageDto = {
      recipientId: this.newMessageForm.recipientId,
      recipientType: this.newMessageForm.recipientType as any,
      recipientName: this.newMessageForm.recipientName,
      content: this.newMessageForm.content.trim()
    };

    console.log('Message DTO (sin sender):', messageDto);

    this.messagingService.sendMessage(messageDto).subscribe({
      next: (response) => {
        console.log('✅ Mensaje enviado exitosamente:', response);
        // Cerrar modal y limpiar formulario
        this.closeNewMessageModal();
        // Recargar conversaciones
        this.loadConversations();
        // Mostrar mensaje de éxito
        alert('¡Mensaje enviado correctamente!');
      },
      error: (error) => {
        console.error('❌ Error enviando mensaje:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error details:', error.error);
        
        // Mensaje de error más detallado
        let errorMessage = 'Error al enviar el mensaje.';
        if (error.status === 401) {
          errorMessage = '❌ No estás autenticado. Por favor, inicia sesión nuevamente.';
        } else if (error.status === 400) {
          errorMessage = `❌ Datos inválidos: ${error.error?.message || 'Verifica los datos del formulario'}`;
        } else if (error.error?.message) {
          errorMessage = `❌ ${error.error.message}`;
        }
        
        alert(errorMessage);
      }
    });
  }

  closeNewMessageModal(): void {
    this.showNewMessageModal = false;
    // Limpiar formulario
    this.newMessageForm = {
      recipientType: '',
      recipientId: '',
      recipientName: '',
      content: ''
    };
    this.availableUsers = [];
  }
}
