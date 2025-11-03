import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
export declare class RabbitMQService implements OnModuleInit, OnModuleDestroy {
    private configService;
    private connection;
    private channel;
    private readonly exchangeName;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    private connect;
    private disconnect;
    publishEvent(routingKey: string, data: any): Promise<void>;
    subscribeToEvent(routingKey: string, queueName: string, callback: (data: any) => Promise<void>): Promise<void>;
    getChannel(): amqp.Channel;
}
