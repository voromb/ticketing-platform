import * as amqp from 'amqplib';

let connection: any = null;
let channel: any = null;

export const connectRabbitMQ = async (): Promise<void> => {
  try {
    const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672';
    
    connection = await amqp.connect(rabbitUrl);
    if (connection) {
      channel = await connection.createChannel();
      
      // Crear exchange principal
      if (channel) {
        await channel.assertExchange('ticketing', 'topic', { durable: true });
      }
    }
    
    console.log('[RABBITMQ] RabbitMQ connected and exchange created');
  } catch (error) {
    throw error;
  }
};

export const publishEvent = async (routingKey: string, data: any): Promise<void> => {
  if (!channel) {
    console.error('RabbitMQ channel not initialized');
    return;
  }
  
  const message = Buffer.from(JSON.stringify({
    event: routingKey,
    data,
    timestamp: new Date().toISOString()
  }));
  
  channel.publish('ticketing', routingKey, message);
  console.log(`[PUBLISH] Event published: ${routingKey}`);
};

export const getChannel = () => channel;