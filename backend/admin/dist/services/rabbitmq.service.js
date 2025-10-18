"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.rabbitmqService = exports.RabbitMQService = void 0;
const amqp = __importStar(require("amqplib"));
const logger_1 = require("../utils/logger");
class RabbitMQService {
    connection = null;
    channel = null;
    connected = false;
    exchange = 'ticketing_events';
    async connect() {
        try {
            const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672';
            this.connection = await amqp.connect(rabbitmqUrl);
            this.channel = await this.connection.createChannel();
            // Crear exchange tipo 'topic' para eventos
            if (this.channel) {
                await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
            }
            this.connected = true;
            logger_1.logger.info('[RABBITMQ] RabbitMQ conectado exitosamente');
        }
        catch (error) {
            logger_1.logger.error('[RABBITMQ] Error conectando a RabbitMQ:', error.message);
            this.connected = false;
        }
    }
    isConnected() {
        return this.connected;
    }
    async publishEvent(routingKey, data) {
        if (!this.connected || !this.channel) {
            logger_1.logger.warn('RabbitMQ no conectado, evento no publicado');
            return;
        }
        try {
            const message = JSON.stringify({
                ...data,
                timestamp: new Date().toISOString()
            });
            this.channel.publish(this.exchange, routingKey, Buffer.from(message), { persistent: true });
            logger_1.logger.info(`[PUBLISH] Evento publicado: ${routingKey}`);
        }
        catch (error) {
            logger_1.logger.error('Error publicando evento:', error);
        }
    }
    async subscribe(routingKey, callback) {
        if (!this.connected || !this.channel) {
            logger_1.logger.warn('RabbitMQ no conectado, no se puede suscribir');
            return;
        }
        try {
            // Crear cola temporal
            const queue = await this.channel.assertQueue('', { exclusive: true });
            // Bindear cola al exchange con routing key
            await this.channel.bindQueue(queue.queue, this.exchange, routingKey);
            // Consumir mensajes
            this.channel.consume(queue.queue, (msg) => {
                if (msg) {
                    try {
                        const data = JSON.parse(msg.content.toString());
                        callback(data);
                        this.channel?.ack(msg);
                    }
                    catch (error) {
                        logger_1.logger.error('Error procesando mensaje:', error);
                        this.channel?.nack(msg, false, false);
                    }
                }
            });
            logger_1.logger.info(`[SUBSCRIBE] Suscrito a eventos: ${routingKey}`);
        }
        catch (error) {
            logger_1.logger.error('Error suscribiéndose a eventos:', error);
        }
    }
    async close() {
        try {
            await this.channel?.close();
            await this.connection?.close();
            this.connected = false;
            logger_1.logger.info('RabbitMQ desconectado');
        }
        catch (error) {
            logger_1.logger.error('Error cerrando RabbitMQ:', error);
        }
    }
}
exports.RabbitMQService = RabbitMQService;
exports.rabbitmqService = new RabbitMQService();
