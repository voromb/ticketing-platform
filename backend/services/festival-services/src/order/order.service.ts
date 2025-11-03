import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PackageOrder, PackageOrderDocument } from './schemas/order.schema';
import { Trip, TripDocument } from '../travel/schemas/trip.schema';
import { Restaurant, RestaurantDocument } from '../restaurant/schemas/restaurant.schema';
import { Product, ProductDocument } from '../merchandising/schemas/product.schema';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(PackageOrder.name) private orderModel: Model<PackageOrderDocument>,
    @InjectModel(Trip.name) private tripModel: Model<TripDocument>,
    @InjectModel(Restaurant.name) private restaurantModel: Model<RestaurantDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async createPackageOrder(orderData: any): Promise<PackageOrder> {
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

  async findAll(): Promise<PackageOrder[]> {
    return this.orderModel.find().sort({ createdAt: -1 }).exec();
  }

  async findByUser(userId: string): Promise<PackageOrder[]> {
    return this.orderModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async findById(id: string): Promise<PackageOrder | null> {
    return this.orderModel.findById(id).exec();
  }

  async updateStatus(id: string, status: string): Promise<PackageOrder | null> {
    return this.orderModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).exec();
  }

  async updatePaymentStatus(id: string, paymentStatus: string, transactionId?: string): Promise<PackageOrder | null> {
    return this.orderModel.findByIdAndUpdate(
      id,
      { paymentStatus, transactionId },
      { new: true }
    ).exec();
  }

  async completePayment(orderId: string): Promise<PackageOrder | null> {
    // Actualizar orden a PAID
    const order = await this.orderModel.findByIdAndUpdate(
      orderId,
      { 
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        transactionId: `demo_${Date.now()}`
      },
      { new: true }
    ).exec();

    return order;
  }
}
