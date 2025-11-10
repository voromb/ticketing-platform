import * as amqp from 'amqplib';
import { logger } from '../utils/logger';

export class RabbitMQService {
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;
  private connected: boolean = false;
  private readonly exchange = 'ticketing_events';

  async connect(): Promise<void> {
    try {
      const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672';
      
      this.connection = await amqp.connect(rabbitmqUrl) as any;
      this.channel = await (this.connection as any).createChannel();
      
      // Crear exchange tipo 'topic' para eventos
      if (this.channel) {
        await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
      }
      
      this.connected = true;
      logger.info('[RABBITMQ] RabbitMQ conectado exitosamente');
    } catch (error: any) {
      logger.error({ err: error }, '[RABBITMQ] Error conectando a RabbitMQ');
      this.connected = false;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  async publishEvent(routingKey: string, data: any): Promise<void> {
    if (!this.connected || !this.channel) {
      logger.warn('RabbitMQ no conectado, evento no publicado');
      return;
    }

    try {
      const message = JSON.stringify({
        ...data,
        timestamp: new Date().toISOString()
      });

      this.channel.publish(
        this.exchange,
        routingKey,
        Buffer.from(message),
        { persistent: true }
      );

      logger.info(`[PUBLISH] Evento publicado: ${routingKey}`);
    } catch (error: any) {
      logger.error({ err: error }, 'Error publicando evento');
    }
  }

  async subscribe(routingKey: string, callback: (data: any) => void): Promise<void> {
    if (!this.connected || !this.channel) {
      logger.warn('RabbitMQ no conectado, no se puede suscribir');
      return;
    }

    try {
      // Crear cola temporal
      const queue = await this.channel.assertQueue('', { exclusive: true });
      
      // Bindear cola al exchange con routing key
      await this.channel.bindQueue(queue.queue, this.exchange, routingKey);
      
      // Consumir mensajes
      this.channel.consume(queue.queue, (msg: any) => {
        if (msg) {
          try {
            const data = JSON.parse(msg.content.toString());
            callback(data);
            this.channel?.ack(msg);
          } catch (error: any) {
            logger.error({ err: error }, 'Error procesando mensaje');
            this.channel?.nack(msg, false, false);
          }
        }
      });

      logger.info(`[SUBSCRIBE] Suscrito a eventos: ${routingKey}`);
    } catch (error: any) {
      logger.error({ err: error }, 'Error suscribiéndose a eventos');
    }
  }

  async close(): Promise<void> {
    try {
      await this.channel?.close();
      await (this.connection as any)?.close();
      this.connected = false;
      logger.info('RabbitMQ desconectado');
    } catch (error: any) {
      logger.error({ err: error }, 'Error cerrando RabbitMQ');
    }
  }
}

export const rabbitmqService = new RabbitMQService();

