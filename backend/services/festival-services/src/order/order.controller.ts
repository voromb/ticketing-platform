import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(@Body() orderData: any) {
    try {
      const order = await this.orderService.createPackageOrder(orderData);
      return {
        success: true,
        message: 'Orden creada exitosamente',
        data: order,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error creando orden',
        error: error.message,
      };
    }
  }

  @Get()
  async findAll() {
    try {
      const orders = await this.orderService.findAll();
      return {
        success: true,
        data: orders,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error obteniendo órdenes',
        error: error.message,
      };
    }
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    try {
      const orders = await this.orderService.findByUser(userId);
      return {
        success: true,
        data: orders,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error obteniendo órdenes del usuario',
        error: error.message,
      };
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const order = await this.orderService.findById(id);
      return {
        success: true,
        data: order,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error obteniendo orden',
        error: error.message,
      };
    }
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    try {
      const order = await this.orderService.updateStatus(id, body.status);
      return {
        success: true,
        message: 'Estado actualizado',
        data: order,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error actualizando estado',
        error: error.message,
      };
    }
  }

  @Patch(':id/payment')
  async updatePayment(
    @Param('id') id: string,
    @Body() body: { paymentStatus: string; transactionId?: string }
  ) {
    try {
      const order = await this.orderService.updatePaymentStatus(
        id,
        body.paymentStatus,
        body.transactionId
      );
      return {
        success: true,
        message: 'Estado de pago actualizado',
        data: order,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error actualizando pago',
        error: error.message,
      };
    }
  }
}
