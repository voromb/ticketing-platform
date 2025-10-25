import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { Order, OrderSchema } from './schemas/order.schema';
import { Trip, TripSchema } from '../travel/schemas/trip.schema';
import { Restaurant, RestaurantSchema } from '../restaurant/schemas/restaurant.schema';
import { Product, ProductSchema } from '../merchandising/schemas/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Trip.name, schema: TripSchema },
      { name: Restaurant.name, schema: RestaurantSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
