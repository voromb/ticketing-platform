import amqp, { Channel, Connection } from 'amqplib';
import { logger } from '../utils/logger';
import { config } from '../config/env';

export class RabbitMQService {
    private connection: Connection | null = null;
    private channel: Channel | null = null;
    private readonly url: string;
    private readonly exchange: string;

    constructor(url: string) {
        this.url = url;
        this.exchange = config.RABBITMQ_EXCHANGE;
    }

    async connect(): Promise<void> {
        try {
            this.connection = await amqp.connect(this.url);
            this.channel = await this.connection.createChannel();

            await this.channel.assertExchange(this.exchange, 'topic', { durable: true });

            logger.info('RabbitMQ connected successfully');
        } catch (error) {
            logger.error('Failed to connect to RabbitMQ:', error);
            // Reintentaremos la conexión más tarde
        }
    }

    async publish(eventType: string, data: any): Promise<void> {
        if (!this.channel) {
            logger.warn('RabbitMQ channel not initialized, skipping publish');
            return;
        }

        const message = Buffer.from(
            JSON.stringify({
                eventType,
                data,
                timestamp: new Date().toISOString(),
                source: 'admin-service',
            })
        );

        await this.channel.publish(this.exchange, eventType, message, { persistent: true });

        logger.debug(`Published event: ${eventType}`);
    }

    isConnected(): boolean {
        return this.connection !== null && this.channel !== null;
    }

    async close(): Promise<void> {
        if (this.channel) await this.channel.close();
        if (this.connection) await this.connection.close();
    }
}
