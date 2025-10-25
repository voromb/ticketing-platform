import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { MerchandisingService } from './merchandising.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AddToCartDto, UpdateCartItemDto, ApplyCouponDto } from './dto/cart.dto';
import { CreateOrderDto, UpdateOrderDto } from './dto/order.dto';
import { CompanyAdminGuard } from '../auth/guards/company-admin.guard';
import { CompanyPermissionGuard } from '../auth/guards/company-permission.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentCompanyAdmin } from '../auth/decorators/current-company-admin.decorator';

@ApiTags('merchandising')
@Controller('merchandising')
export class MerchandisingController {
  constructor(private readonly merchandisingService: MerchandisingService) {}

  @Post()
  @UseGuards(CompanyAdminGuard, CompanyPermissionGuard)
  @RequirePermissions('canCreate')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un nuevo producto (requiere autenticación COMPANY_ADMIN)' })
  @ApiResponse({ status: 201, description: 'Producto creado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  create(
    @Body() createProductDto: CreateProductDto,
    @CurrentCompanyAdmin() admin: any,
  ) {
    return this.merchandisingService.createWithCompany(createProductDto, admin);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los productos' })
  @ApiQuery({ name: 'festivalId', required: false })
  @ApiQuery({ name: 'bandId', required: false })
  @ApiResponse({ status: 200, description: 'Lista de productos' })
  findAll(
    @Query('festivalId') festivalId?: string,
    @Query('bandId') bandId?: string
  ) {
    if (festivalId) {
      return this.merchandisingService.findByFestival(festivalId);
    }
    if (bandId) {
      return this.merchandisingService.findByBand(bandId);
    }
    return this.merchandisingService.findAll();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas de productos' })
  @ApiResponse({ status: 200, description: 'Estadísticas de productos' })
  async getStats() {
    const products = await this.merchandisingService.findAll();
    const totalProducts = products.length;
    const totalStock = products.reduce((sum, p) => sum + (p.stock?.available || 0), 0);
    const totalSold = products.reduce((sum, p) => sum + (p.soldUnits || 0), 0);
    const activeProducts = products.filter(p => p.isActive).length;
    const lowStock = products.filter(p => (p.stock?.available || 0) < 10).length;
    const outOfStock = products.filter(p => (p.stock?.available || 0) === 0).length;

    return {
      totalProducts,
      activeProducts,
      totalStock,
      totalSold,
      lowStock,
      outOfStock,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un producto por ID' })
  @ApiResponse({ status: 200, description: 'Producto encontrado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  findOne(@Param('id') id: string) {
    return this.merchandisingService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un producto' })
  @ApiResponse({ status: 200, description: 'Producto actualizado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.merchandisingService.update(id, updateProductDto);
  }

  @Post(':id/reserve')
  @ApiOperation({ summary: 'Reservar stock de un producto' })
  @ApiResponse({ status: 200, description: 'Stock reservado' })
  reserveStock(@Param('id') id: string, @Body('quantity') quantity: number) {
    return this.merchandisingService.reserveStock(id, quantity);
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Confirmar compra de producto' })
  @ApiResponse({ status: 200, description: 'Compra confirmada' })
  confirmPurchase(@Param('id') id: string, @Body('quantity') quantity: number) {
    return this.merchandisingService.confirmPurchase(id, quantity);
  }

  @Post(':id/release')
  @ApiOperation({ summary: 'Liberar stock reservado' })
  @ApiResponse({ status: 200, description: 'Stock liberado' })
  releaseStock(@Param('id') id: string, @Body('quantity') quantity: number) {
    return this.merchandisingService.releaseStock(id, quantity);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un producto (soft delete)' })
  @ApiResponse({ status: 204, description: 'Producto eliminado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  remove(@Param('id') id: string) {
    return this.merchandisingService.remove(id);
  }

  // ==================== CART ENDPOINTS ====================

  @Get('cart/:userId')
  @ApiOperation({ summary: 'Obtener carrito del usuario' })
  @ApiResponse({ status: 200, description: 'Carrito del usuario' })
  getCart(@Param('userId') userId: string) {
    return this.merchandisingService.getCart(userId);
  }

  @Post('cart/:userId/add')
  @ApiOperation({ summary: 'Añadir producto al carrito' })
  @ApiResponse({ status: 200, description: 'Producto añadido al carrito' })
  @ApiResponse({ status: 400, description: 'Stock insuficiente' })
  addToCart(
    @Param('userId') userId: string,
    @Body() addToCartDto: AddToCartDto,
  ) {
    return this.merchandisingService.addToCart(userId, addToCartDto);
  }

  @Patch('cart/:userId/item/:productId')
  @ApiOperation({ summary: 'Actualizar cantidad de producto en carrito' })
  @ApiResponse({ status: 200, description: 'Carrito actualizado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado en carrito' })
  updateCartItem(
    @Param('userId') userId: string,
    @Param('productId') productId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.merchandisingService.updateCartItem(userId, productId, updateCartItemDto);
  }

  @Delete('cart/:userId/item/:productId')
  @ApiOperation({ summary: 'Eliminar producto del carrito' })
  @ApiResponse({ status: 200, description: 'Producto eliminado del carrito' })
  removeFromCart(
    @Param('userId') userId: string,
    @Param('productId') productId: string,
    @Query('size') size?: string,
  ) {
    return this.merchandisingService.removeFromCart(userId, productId, size);
  }

  @Delete('cart/:userId')
  @ApiOperation({ summary: 'Vaciar carrito completo' })
  @ApiResponse({ status: 200, description: 'Carrito vaciado' })
  clearCart(@Param('userId') userId: string) {
    return this.merchandisingService.clearCart(userId);
  }

  @Post('cart/:userId/coupon')
  @ApiOperation({ summary: 'Aplicar cupón de descuento' })
  @ApiResponse({ status: 200, description: 'Cupón aplicado' })
  @ApiResponse({ status: 400, description: 'Cupón inválido' })
  applyCoupon(
    @Param('userId') userId: string,
    @Body() applyCouponDto: ApplyCouponDto,
  ) {
    return this.merchandisingService.applyCoupon(userId, applyCouponDto);
  }

  // ==================== ORDER ENDPOINTS ====================

  @Post('orders')
  @ApiOperation({ summary: 'Crear pedido desde carrito' })
  @ApiResponse({ status: 201, description: 'Pedido creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Carrito vacío o stock insuficiente' })
  createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.merchandisingService.createOrderFromCart(createOrderDto);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Obtener todos los pedidos' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filtrar por ID de usuario' })
  @ApiResponse({ status: 200, description: 'Lista de pedidos' })
  findAllOrders(@Query('userId') userId?: string) {
    if (userId) {
      return this.merchandisingService.findOrdersByUser(userId);
    }
    return this.merchandisingService.findAllOrders();
  }

  @Get('orders/stats')
  @ApiOperation({ summary: 'Obtener estadísticas de pedidos' })
  @ApiQuery({ name: 'userId', required: false, description: 'Estadísticas de un usuario específico' })
  @ApiResponse({ status: 200, description: 'Estadísticas de pedidos' })
  getOrderStats(@Query('userId') userId?: string) {
    return this.merchandisingService.getOrderStats(userId);
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Obtener pedido por ID' })
  @ApiResponse({ status: 200, description: 'Pedido encontrado' })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado' })
  findOrderById(@Param('id') id: string) {
    return this.merchandisingService.findOrderById(id);
  }

  @Get('orders/number/:orderNumber')
  @ApiOperation({ summary: 'Obtener pedido por número' })
  @ApiResponse({ status: 200, description: 'Pedido encontrado' })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado' })
  findOrderByNumber(@Param('orderNumber') orderNumber: string) {
    return this.merchandisingService.findOrderByNumber(orderNumber);
  }

  @Patch('orders/:id')
  @ApiOperation({ summary: 'Actualizar pedido' })
  @ApiResponse({ status: 200, description: 'Pedido actualizado' })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado' })
  updateOrder(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.merchandisingService.updateOrder(id, updateOrderDto);
  }

  @Post('orders/:id/cancel')
  @ApiOperation({ summary: 'Cancelar pedido' })
  @ApiResponse({ status: 200, description: 'Pedido cancelado' })
  @ApiResponse({ status: 400, description: 'No se puede cancelar el pedido' })
  cancelOrder(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.merchandisingService.cancelOrder(id, reason);
  }
}