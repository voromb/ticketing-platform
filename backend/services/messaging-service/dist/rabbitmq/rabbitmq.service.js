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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMQService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const amqp = __importStar(require("amqplib"));
let RabbitMQService = class RabbitMQService {
    configService;
    connection;
    channel;
    exchangeName = 'ticketing_events';
    constructor(configService) {
        this.configService = configService;
    }
    async onModuleInit() {
        await this.connect();
    }
    async onModuleDestroy() {
        await this.disconnect();
    }
    async connect() {
        try {
            const rabbitmqUrl = this.configService.get('RABBITMQ_URL') || 'amqp://localhost:5672';
            this.connection = await amqp.connect(rabbitmqUrl);
            this.channel = await this.connection.createChannel();
            await this.channel.assertExchange(this.exchangeName, 'topic', {
                durable: true,
            });
            console.log('✅ RabbitMQ connected successfully');
            console.log(`📡 Exchange "${this.exchangeName}" ready`);
        }
        catch (error) {
            console.error('❌ RabbitMQ connection error:', error);
            setTimeout(() => this.connect(), 5000);
        }
    }
    async disconnect() {
        try {
            await this.channel?.close();
            await this.connection?.close();
            console.log('🔌 RabbitMQ disconnected');
        }
        catch (error) {
            console.error('Error disconnecting from RabbitMQ:', error);
        }
    }
    async publishEvent(routingKey, data) {
        try {
            const message = JSON.stringify(data);
            this.channel.publish(this.exchangeName, routingKey, Buffer.from(message), { persistent: true });
            console.log(`📤 Event published: ${routingKey}`, data);
        }
        catch (error) {
            console.error(`❌ Error publishing event ${routingKey}:`, error);
            throw error;
        }
    }
    async subscribeToEvent(routingKey, queueName, callback) {
        try {
            await this.channel.assertQueue(queueName, {
                durable: true,
            });
            await this.channel.bindQueue(queueName, this.exchangeName, routingKey);
            this.channel.consume(queueName, async (msg) => {
                if (msg) {
                    try {
                        const data = JSON.parse(msg.content.toString());
                        console.log(`📥 Event received: ${routingKey}`, data);
                        await callback(data);
                        this.channel.ack(msg);
                    }
                    catch (error) {
                        console.error(`❌ Error processing event ${routingKey}:`, error);
                        this.channel.nack(msg, false, true);
                    }
                }
            }, { noAck: false });
            console.log(`👂 Listening to events: ${routingKey} on queue: ${queueName}`);
        }
        catch (error) {
            console.error(`❌ Error subscribing to ${routingKey}:`, error);
            throw error;
        }
    }
    getChannel() {
        return this.channel;
    }
};
exports.RabbitMQService = RabbitMQService;
exports.RabbitMQService = RabbitMQService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RabbitMQService);
//# sourceMappingURL=rabbitmq.service.js.map