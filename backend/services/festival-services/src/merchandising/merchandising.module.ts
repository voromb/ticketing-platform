import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MerchandisingService } from './merchandising.service';
import { MerchandisingController } from './merchandising.controller';
import { Product, ProductSchema } from './schemas/product.schema';
import { Cart, CartSchema } from './schemas/cart.schema';
import { Order, OrderSchema } from './schemas/order.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Cart.name, schema: CartSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          queue: process.env.RABBITMQ_QUEUE_APPROVAL_REQUESTS || 'approval_requests',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
    AuthModule,
  ],
  controllers: [MerchandisingController],
  providers: [MerchandisingService],
  exports: [MerchandisingService]
})
export class MerchandisingModule {}