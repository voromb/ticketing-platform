import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
import { MessageModule } from './message/message.module';
import { NotificationModule } from './notification/notification.module';
import { ListenersModule } from './rabbitmq/listeners/listeners.module';
import type { Connection } from 'mongoose';

@Module({
  imports: [
    // Configuration Module
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // MongoDB Connection
    MongooseModule.forRoot(
      process.env.MONGODB_URI ||
        'mongodb://localhost:27017/ticketing_messaging',
      {
        connectionFactory: (connection: Connection) => {
          connection.on('connected', () => {
            console.log('✅ MongoDB connected successfully');
          });
          connection.on('error', (error: Error) => {
            console.error('❌ MongoDB connection error:', error);
          });
          return connection;
        },
      },
    ),

    // RabbitMQ Module
    RabbitMQModule,

    // Feature Modules
    MessageModule,
    NotificationModule,

    // RabbitMQ Listeners
    ListenersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
