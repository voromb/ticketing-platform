export class RabbitMQService {
  private connected: boolean = false;

  async connect(): Promise<void> {
    try {
      // Por ahora es un mock, no intenta conectar realmente
      this.connected = true;
      console.log('RabbitMQ service initialized (mock mode)');
    } catch (error) {
      console.error('Error in RabbitMQ mock:', error);
      this.connected = false;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  async publishEvent(eventName: string, data: any): Promise<void> {
    if (this.connected) {
      console.log(`[RabbitMQ] Event published: ${eventName}`);
    }
  }

  async close(): Promise<void> {
    this.connected = false;
    console.log('RabbitMQ connection closed');
  }
}

