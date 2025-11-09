import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService } from '~/app/core/services/ai.service';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-widget.html',
  styleUrls: ['./chat-widget.css'],
})
export class ChatWidgetComponent implements OnInit {
  isOpen = false;
  messages: ChatMessage[] = [];
  userMessage = '';
  isLoading = false;

  constructor(private aiService: AiService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Mensaje de bienvenida
    this.messages.push({
      role: 'assistant',
      content: '¡Hola! 🎸 Soy tu asistente de eventos de rock y metal. ¿En qué puedo ayudarte?',
      timestamp: new Date(),
    });
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
  }

  sendMessage(): void {
    if (!this.userMessage.trim() || this.isLoading) {
      return;
    }

    // Agregar mensaje del usuario
    this.messages.push({
      role: 'user',
      content: this.userMessage,
      timestamp: new Date(),
    });

    const userMsg = this.userMessage;
    this.userMessage = '';
    this.isLoading = true;

    // Llamar a la IA
    this.aiService.chat(userMsg).subscribe({
      next: (response) => {
        this.messages.push({
          role: 'assistant',
          content: response,
          timestamp: new Date(),
        });
        this.isLoading = false;
        this.cdr.detectChanges();
        this.scrollToBottom();
      },
      error: (error) => {
        console.error('❌ Error en chat:', error);
        this.messages.push({
          role: 'assistant',
          content: 'Lo siento, hubo un error. Por favor intenta de nuevo.',
          timestamp: new Date(),
        });
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const chatBody = document.querySelector('.chat-body');
      if (chatBody) {
        chatBody.scrollTop = chatBody.scrollHeight;
      }
    }, 100);
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
