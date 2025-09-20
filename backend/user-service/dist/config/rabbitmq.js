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
exports.getChannel = exports.publishEvent = exports.connectRabbitMQ = void 0;
const amqp = __importStar(require("amqplib"));
let connection = null;
let channel = null;
const connectRabbitMQ = async () => {
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
        console.log('✅ RabbitMQ connected and exchange created');
    }
    catch (error) {
        throw error;
    }
};
exports.connectRabbitMQ = connectRabbitMQ;
const publishEvent = async (routingKey, data) => {
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
    console.log(`📤 Event published: ${routingKey}`);
};
exports.publishEvent = publishEvent;
const getChannel = () => channel;
exports.getChannel = getChannel;
//# sourceMappingURL=rabbitmq.js.map