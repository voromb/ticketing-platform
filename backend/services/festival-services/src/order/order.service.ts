import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { Trip, TripDocument } from '../travel/schemas/trip.schema';
import { Restaurant, RestaurantDocument } from '../restaurant/schemas/restaurant.schema';
import { Product, ProductDocument } from '../merchandising/schemas/product.schema';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Trip.name) private tripModel: Model<TripDocument>,
    @InjectModel(Restaurant.name) private restaurantModel: Model<RestaurantDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async createPackageOrder(orderData: any): Promise<Order> {
    // Crear la orden
    const order = new this.orderModel(orderData);
    await order.save();

    // Actualizar viaje si existe
    if (orderData.tripId) {
      await this.tripModel.findByIdAndUpdate(
        orderData.tripId,
        { $inc: { bookedSeats: orderData.ticketQuantity } }
      );
    }

    // Crear reserva de restaurante si existe
    if (orderData.restaurantId) {
      // Aquí podrías crear un documento de Reservation separado
      // Por ahora solo incrementamos las reservas
      await this.restaurantModel.findByIdAndUpdate(
        orderData.restaurantId,
        { $inc: { currentOccupancy: orderData.numberOfPeople || 2 } }
      );
    }

    // Actualizar stock de productos
    if (orderData.merchandising && orderData.merchandising.length > 0) {
      for (const item of orderData.merchandising) {
        await this.productModel.findByIdAndUpdate(
          item.productId,
          {
            $inc: {
              'stock.available': -item.quantity,
              soldUnits: item.quantity,
            },
          }
        );
      }
    }

    return order;
  }

  async findAll(): Promise<Order[]> {
    return this.orderModel.find().sort({ createdAt: -1 }).exec();
  }

  async findByUser(userId: string): Promise<Order[]> {
    return this.orderModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async findById(id: string): Promise<Order | null> {
    return this.orderModel.findById(id).exec();
  }

  async updateStatus(id: string, status: string): Promise<Order | null> {
    return this.orderModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).exec();
  }

  async updatePaymentStatus(id: string, paymentStatus: string, transactionId?: string): Promise<Order | null> {
    return this.orderModel.findByIdAndUpdate(
      id,
      { paymentStatus, transactionId },
      { new: true }
    ).exec();
  }
}
