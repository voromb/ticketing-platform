import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: any;
  private channel: any;
  private readonly exchangeName = 'ticketing_events';

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect() {
    try {
      const rabbitmqUrl = this.configService.get<string>('RABBITMQ_URL') || 'amqp://localhost:5672';
      
      this.connection = await amqp.connect(rabbitmqUrl) as any;
      this.channel = await this.connection.createChannel() as any;

      // Crear exchange tipo 'topic' para eventos
      await this.channel.assertExchange(this.exchangeName, 'topic', {
        durable: true,
      });

      console.log('✅ RabbitMQ connected successfully');
      console.log(`📡 Exchange "${this.exchangeName}" ready`);
    } catch (error) {
      console.error('❌ RabbitMQ connection error:', error);
      // Reintentar conexión después de 5 segundos
      setTimeout(() => this.connect(), 5000);
    }
  }

  private async disconnect() {
    try {
      await this.channel?.close();
      await this.connection?.close();
      console.log('🔌 RabbitMQ disconnected');
    } catch (error) {
      console.error('Error disconnecting from RabbitMQ:', error);
    }
  }

  /**
   * Publicar un evento en RabbitMQ
   */
  async publishEvent(routingKey: string, data: any) {
    try {
      const message = JSON.stringify(data);
      this.channel.publish(
        this.exchangeName,
        routingKey,
        Buffer.from(message),
        { persistent: true }
      );
      console.log(`📤 Event published: ${routingKey}`, data);
    } catch (error) {
      console.error(`❌ Error publishing event ${routingKey}:`, error);
      throw error;
    }
  }

  /**
   * Suscribirse a eventos de RabbitMQ
   */
  async subscribeToEvent(
    routingKey: string,
    queueName: string,
    callback: (data: any) => Promise<void>
  ) {
    try {
      // Crear cola
      await this.channel.assertQueue(queueName, {
        durable: true,
      });

      // Vincular cola al exchange con routing key
      await this.channel.bindQueue(queueName, this.exchangeName, routingKey);

      // Consumir mensajes
      this.channel.consume(
        queueName,
        async (msg) => {
          if (msg) {
            try {
              const data = JSON.parse(msg.content.toString());
              console.log(`📥 Event received: ${routingKey}`, data);
              
              await callback(data);
              
              // Acknowledge message
              this.channel.ack(msg);
            } catch (error) {
              console.error(`❌ Error processing event ${routingKey}:`, error);
              // Reject and requeue message
              this.channel.nack(msg, false, true);
            }
          }
        },
        { noAck: false }
      );

      console.log(`👂 Listening to events: ${routingKey} on queue: ${queueName}`);
    } catch (error) {
      console.error(`❌ Error subscribing to ${routingKey}:`, error);
      throw error;
    }
  }

  /**
   * Obtener el canal de RabbitMQ (para uso avanzado)
   */
  getChannel(): amqp.Channel {
    return this.channel;
  }
}
