import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(@Body() orderData: any) {
    try {
      console.log('📦 Creando orden con datos:', JSON.stringify(orderData, null, 2));
      const order = await this.orderService.createPackageOrder(orderData);
      console.log('✅ Orden creada exitosamente:', (order as any)._id);
      return {
        success: true,
        message: 'Orden creada exitosamente',
        data: order,
      };
    } catch (error) {
      console.error('❌ Error creando orden:', error);
      console.error('Stack:', error.stack);
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

  @Post('complete-payment')
  async completePayment(@Body() body: { orderId: string }) {
    try {
      console.log('💳 Procesando pago para orden:', body.orderId);
      const order = await this.orderService.completePayment(body.orderId);
      
      if (!order) {
        console.error('❌ Orden no encontrada:', body.orderId);
        return {
          success: false,
          message: 'Orden no encontrada',
        };
      }

      console.log('✅ Pago completado exitosamente para orden:', body.orderId);
      return {
        success: true,
        message: 'Pago completado exitosamente',
        data: {
          order,
          message: 'Tu compra ha sido procesada correctamente'
        },
      };
    } catch (error) {
      console.error('❌ Error procesando pago:', error);
      return {
        success: false,
        message: 'Error procesando pago',
        error: error.message,
      };
    }
  }
}
