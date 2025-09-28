"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMQService = void 0;
class RabbitMQService {
    connected = false;
    async connect() {
        try {
            // Por ahora es un mock, no intenta conectar realmente
            this.connected = true;
            console.log('RabbitMQ service initialized (mock mode)');
        }
        catch (error) {
            console.error('Error in RabbitMQ mock:', error);
            this.connected = false;
        }
    }
    isConnected() {
        return this.connected;
    }
    async publishEvent(eventName, data) {
        if (this.connected) {
            console.log(`[RabbitMQ] Event published: ${eventName}`);
        }
    }
    async close() {
        this.connected = false;
        console.log('RabbitMQ connection closed');
    }
}
exports.RabbitMQService = RabbitMQService;
