import { Injectable, NotFoundException, BadRequestException, Inject, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientProxy, EventPattern, Payload } from '@nestjs/microservices';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { Cart, CartDocument } from './schemas/cart.schema';
import { Order, OrderDocument, OrderStatus, PaymentStatus } from './schemas/order.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AddToCartDto, UpdateCartItemDto, ApplyCouponDto } from './dto/cart.dto';
import { CreateOrderDto, UpdateOrderDto } from './dto/order.dto';
import { ApprovalService } from '../approval/approval.service';

@Injectable()
export class MerchandisingService implements OnModuleInit {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
    private readonly approvalService: ApprovalService,
  ) {}

  async onModuleInit() {
    await this.client.connect();
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const createdProduct = new this.productModel(createProductDto);
    return createdProduct.save();
  }

  /**
   * Crear producto con datos de compañía (para COMPANY_ADMIN)
   */
  async createWithCompany(createProductDto: CreateProductDto, admin: any): Promise<Product> {
    console.log('[MERCHANDISING] 🔵 createWithCompany llamado');
    console.log('[MERCHANDISING] Admin:', JSON.stringify(admin, null, 2));
    console.log('[MERCHANDISING] Product DTO:', JSON.stringify(createProductDto, null, 2));
    
    // Determinar el stock total (puede venir como totalStock o como objeto stock)
    const totalStock = createProductDto.totalStock || (createProductDto as any).stock?.total || 0;
    
    const productData = {
      ...createProductDto,
      companyId: admin.companyId,
      companyName: admin.companyName,
      region: admin.companyRegion,
      managedBy: admin.email,
      approvalStatus: 'PENDING',
      lastModifiedBy: admin.email,
      stock: {
        total: totalStock,
        available: totalStock,
        reserved: 0
      }
    };

    const createdProduct = new this.productModel(productData);
    const saved = await createdProduct.save();

    // Crear solicitud de aprobación en PostgreSQL
    try {
      await this.approvalService.createApprovalRequest({
        resourceType: 'PRODUCT',
        resourceId: (saved as any)._id.toString(),
        resourceName: saved.name,
        companyId: admin.companyId,
        companyName: admin.companyName,
        requestedBy: admin.email,
        metadata: {
          region: admin.companyRegion,
          price: saved.price,
          stock: saved.stock,
        },
      });
      console.log(`[MERCHANDISING] Solicitud de aprobación creada para ${saved.name}`);
    } catch (error) {
      console.error('[MERCHANDISING] Error creando solicitud de aprobación:', error);
      // No fallar la creación del producto si falla la aprobación
    }

    // Enviar evento de aprobación requerida
    const approvalEvent = {
      service: 'MERCHANDISING',
      entityId: (saved as any)._id.toString(),
      entityType: 'Product',
      resourceType: 'PRODUCT',
      resourceName: saved.name,
      companyId: admin.companyId,
      companyName: admin.companyName,
      requestedBy: admin.email,
      requestedByName: admin.companyName,
      approvalId: null,
      metadata: {
        productName: saved.name,
        companyName: admin.companyName,
        region: admin.companyRegion,
        price: saved.price,
        stock: saved.stock,
      },
      priority: 'MEDIUM',
    };
    
    console.log('[MERCHANDISING] 🔴 Publicando evento approval.requested:', JSON.stringify(approvalEvent, null, 2));
    this.client.emit('approval.requested', approvalEvent);
    console.log('[MERCHANDISING] 🟢 Evento publicado exitosamente');

    console.log(`[MERCHANDISING] Nuevo producto creado por ${admin.email}, requiere aprobación`);
    return saved;
  }

  async findAll(): Promise<Product[]> {
    return this.productModel.find({ isActive: true }).exec();
  }

  async findByFestival(festivalId: string): Promise<Product[]> {
    return this.productModel.find({ 
      festivalId, 
      isActive: true 
    }).exec();
  }

  async findByBand(bandId: string): Promise<Product[]> {
    return this.productModel.find({ 
      bandId, 
      isActive: true 
    }).exec();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    if (updateProductDto.totalStock !== undefined) {
      const product = await this.findOne(id);
      const reservedStock = product.stock.reserved;
      
      if (updateProductDto.totalStock < reservedStock) {
        throw new BadRequestException('El stock total no puede ser menor que el stock reservado');
      }
      
      const stockUpdate = {
        'stock.total': updateProductDto.totalStock,
        'stock.available': updateProductDto.totalStock - reservedStock
      };
      
      delete updateProductDto.totalStock;
      Object.assign(updateProductDto, stockUpdate);
    }

    const updatedProduct = await this.productModel
      .findByIdAndUpdate(id, updateProductDto, { new: true })
      .exec();
    
    if (!updatedProduct) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    return updatedProduct;
  }

  async updateApprovalStatus(id: string, data: { approvalStatus: string; reviewedBy?: string; reviewedAt?: Date; rejectionReason?: string }): Promise<Product> {
    const updatedProduct = await this.productModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    
    if (!updatedProduct) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    console.log(`[MERCHANDISING] Estado de aprobación actualizado: ${id} -> ${data.approvalStatus}`);
    return updatedProduct;
  }

  async remove(id: string): Promise<Product> {
    const deletedProduct = await this.productModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .exec();
    
    if (!deletedProduct) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    return deletedProduct;
  }

  async reserveStock(id: string, quantity: number): Promise<Product> {
    const product = await this.findOne(id);
    
    if (product.stock.available < quantity) {
      throw new BadRequestException('Stock insuficiente');
    }

    const updatedProduct = await this.productModel.findByIdAndUpdate(
      id,
      {
        $inc: {
          'stock.available': -quantity,
          'stock.reserved': quantity
        }
      },
      { new: true }
    ).exec();

    if (!updatedProduct) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    return updatedProduct;
  }

  async confirmPurchase(id: string, quantity: number): Promise<Product> {
    const product = await this.findOne(id);
    
    if (product.stock.reserved < quantity) {
      throw new BadRequestException('No hay suficiente stock reservado');
    }

    const updatedProduct = await this.productModel.findByIdAndUpdate(
      id,
      {
        $inc: {
          'stock.reserved': -quantity,
          soldUnits: quantity
        }
      },
      { new: true }
    ).exec();

    if (!updatedProduct) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    return updatedProduct;
  }

  async releaseStock(id: string, quantity: number): Promise<Product> {
    const updatedProduct = await this.productModel.findByIdAndUpdate(
      id,
      {
        $inc: {
          'stock.available': quantity,
          'stock.reserved': -quantity
        }
      },
      { new: true }
    ).exec();

    if (!updatedProduct) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    return updatedProduct;
  }

  // ==================== CART METHODS ====================

  async getCart(userId: string): Promise<Cart> {
    let cart = await this.cartModel.findOne({ userId }).populate('items.productId').exec();
    
    if (!cart) {
      // Crear carrito vacío si no existe
      cart = new this.cartModel({
        userId,
        items: [],
        totalAmount: 0,
        totalItems: 0,
        finalAmount: 0,
      });
      await cart.save();
    }
    
    return cart;
  }

  async addToCart(userId: string, addToCartDto: AddToCartDto): Promise<Cart> {
    const product = await this.findOne(addToCartDto.productId);
    
    // Verificar disponibilidad
    if (product.stock.available < addToCartDto.quantity) {
      throw new BadRequestException(
        `Stock insuficiente. Disponible: ${product.stock.available}, Solicitado: ${addToCartDto.quantity}`
      );
    }

    let cart = await this.cartModel.findOne({ userId }).exec();
    
    if (!cart) {
      cart = new this.cartModel({ userId, items: [], totalAmount: 0, totalItems: 0 });
    }

    // Buscar si el producto ya está en el carrito
    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === addToCartDto.productId && 
               item.size === addToCartDto.size
    );

    const unitPrice = product.price;
    const totalPrice = unitPrice * addToCartDto.quantity;

    if (existingItemIndex >= 0) {
      // Actualizar cantidad existente
      const newQuantity = cart.items[existingItemIndex].quantity + addToCartDto.quantity;
      
      // Verificar stock total
      if (product.stock.available < newQuantity) {
        throw new BadRequestException(
          `Stock insuficiente para la cantidad total. Disponible: ${product.stock.available}, Total solicitado: ${newQuantity}`
        );
      }
      
      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].totalPrice = unitPrice * newQuantity;
    } else {
      // Añadir nuevo item
      cart.items.push({
        productId: (product as any)._id,
        quantity: addToCartDto.quantity,
        size: addToCartDto.size,
        unitPrice,
        totalPrice,
      } as any);
    }

    // Recalcular totales
    await this.recalculateCartTotals(cart);
    
    return cart.save();
  }

  async updateCartItem(userId: string, productId: string, updateCartItemDto: UpdateCartItemDto): Promise<Cart> {
    const cart = await this.cartModel.findOne({ userId }).exec();
    
    if (!cart) {
      throw new NotFoundException('Carrito no encontrado');
    }

    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId && 
               item.size === updateCartItemDto.size
    );

    if (itemIndex === -1) {
      throw new NotFoundException('Producto no encontrado en el carrito');
    }

    const product = await this.findOne(productId);
    
    // Verificar disponibilidad
    if (product.stock.available < updateCartItemDto.quantity) {
      throw new BadRequestException(
        `Stock insuficiente. Disponible: ${product.stock.available}, Solicitado: ${updateCartItemDto.quantity}`
      );
    }

    // Actualizar item
    cart.items[itemIndex].quantity = updateCartItemDto.quantity;
    cart.items[itemIndex].size = updateCartItemDto.size;
    cart.items[itemIndex].totalPrice = cart.items[itemIndex].unitPrice * updateCartItemDto.quantity;

    // Recalcular totales
    await this.recalculateCartTotals(cart);
    
    return cart.save();
  }

  async removeFromCart(userId: string, productId: string, size?: string): Promise<Cart> {
    const cart = await this.cartModel.findOne({ userId }).exec();
    
    if (!cart) {
      throw new NotFoundException('Carrito no encontrado');
    }

    cart.items = cart.items.filter(
      item => !(item.productId.toString() === productId && item.size === size)
    );

    // Recalcular totales
    await this.recalculateCartTotals(cart);
    
    return cart.save();
  }

  async clearCart(userId: string): Promise<Cart> {
    const cart = await this.cartModel.findOne({ userId }).exec();
    
    if (!cart) {
      throw new NotFoundException('Carrito no encontrado');
    }

    cart.items = [];
    cart.totalAmount = 0;
    cart.totalItems = 0;
    cart.discount = 0;
    cart.finalAmount = 0;
    cart.couponCode = undefined;

    return cart.save();
  }

  async applyCoupon(userId: string, applyCouponDto: ApplyCouponDto): Promise<Cart> {
    const cart = await this.cartModel.findOne({ userId }).exec();
    
    if (!cart) {
      throw new NotFoundException('Carrito no encontrado');
    }

    // Simular validación de cupón (en producción sería una tabla de cupones)
    const discount = this.calculateCouponDiscount(applyCouponDto.couponCode, cart.totalAmount);
    
    if (discount === 0) {
      throw new BadRequestException('Cupón inválido o expirado');
    }

    cart.couponCode = applyCouponDto.couponCode;
    cart.discount = discount;
    cart.finalAmount = Math.max(0, cart.totalAmount - discount);

    return cart.save();
  }

  private async recalculateCartTotals(cart: Cart): Promise<void> {
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalAmount = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
    
    // Recalcular descuento si hay cupón
    if (cart.couponCode) {
      cart.discount = this.calculateCouponDiscount(cart.couponCode, cart.totalAmount);
    } else {
      cart.discount = 0;
    }
    
    cart.finalAmount = Math.max(0, cart.totalAmount - (cart.discount || 0));
    cart.lastUpdated = new Date();
  }

  private calculateCouponDiscount(couponCode: string, totalAmount: number): number {
    // Simulación de cupones (en producción sería una consulta a BD)
    const coupons: Record<string, { type: 'percentage' | 'fixed', value: number, minAmount?: number }> = {
      'FESTIVAL2025': { type: 'percentage', value: 10, minAmount: 50 },
      'WELCOME20': { type: 'percentage', value: 20, minAmount: 30 },
      'SAVE5': { type: 'fixed', value: 5, minAmount: 25 },
    };

    const coupon = coupons[couponCode.toUpperCase()];
    
    if (!coupon || (coupon.minAmount && totalAmount < coupon.minAmount)) {
      return 0;
    }

    if (coupon.type === 'percentage') {
      return (totalAmount * coupon.value) / 100;
    } else {
      return coupon.value;
    }
  }

  // ==================== ORDER METHODS ====================

  async createOrderFromCart(createOrderDto: CreateOrderDto): Promise<Order> {
    const cart = await this.cartModel.findOne({ userId: createOrderDto.userId }).populate('items.productId').exec();
    
    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('El carrito está vacío');
    }

    // Verificar stock de todos los productos
    for (const item of cart.items) {
      const product = await this.findOne(item.productId.toString());
      if (product.stock.available < item.quantity) {
        throw new BadRequestException(
          `Stock insuficiente para ${product.name}. Disponible: ${product.stock.available}, Solicitado: ${item.quantity}`
        );
      }
    }

    // Generar número de pedido único
    const orderNumber = await this.generateOrderNumber();

    // Determinar si requiere aprobación (pedidos grandes o productos VIP)
    const totalValue = cart.finalAmount || cart.totalAmount;
    const hasVipProducts = cart.items.some(item => (item.productId as any).isVipExclusive);
    const requiresApproval = totalValue >= 200 || hasVipProducts;

    // Crear items del pedido con snapshot de datos
    const orderItems = cart.items.map(item => ({
      productId: item.productId._id || item.productId,
      productName: (item.productId as any).name,
      quantity: item.quantity,
      size: item.size,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      productImage: (item.productId as any).images?.[0],
    }));

    // Calcular costos adicionales
    const subtotal = cart.totalAmount;
    const discount = cart.discount || 0;
    const shippingCost = this.calculateShippingCost(subtotal, createOrderDto.shippingAddress.country);
    const taxes = this.calculateTaxes(subtotal - discount, createOrderDto.shippingAddress.country);
    const totalAmount = subtotal - discount + shippingCost + taxes;

    const orderData = {
      orderNumber,
      userId: createOrderDto.userId,
      customerEmail: createOrderDto.customerEmail,
      items: orderItems,
      subtotal,
      discount,
      shippingCost,
      taxes,
      totalAmount,
      status: requiresApproval ? OrderStatus.REQUIRES_APPROVAL : OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      shippingAddress: createOrderDto.shippingAddress,
      couponCode: cart.couponCode,
      metadata: createOrderDto.metadata,
    };

    const order = new this.orderModel(orderData);
    const savedOrder = await order.save();

    // Reservar stock de los productos
    for (const item of cart.items) {
      await this.reserveStock(item.productId.toString(), item.quantity);
    }

    // Si requiere aprobación, publicar evento
    if (requiresApproval) {
      await this.publishApprovalRequest(savedOrder);
    }

    // Limpiar carrito
    await this.clearCart(createOrderDto.userId);

    return savedOrder;
  }

  private async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.orderModel.countDocuments({
      createdAt: { $gte: new Date(year, 0, 1) }
    });
    
    return `ORD-${year}-${(count + 1).toString().padStart(6, '0')}`;
  }

  private calculateShippingCost(subtotal: number, country: string): number {
    if (subtotal >= 100) return 0; // Envío gratis por compras mayores a 100€
    
    const shippingRates: Record<string, number> = {
      'España': 5.99,
      'Portugal': 8.99,
      'Francia': 12.99,
      'default': 15.99,
    };
    
    return shippingRates[country] || shippingRates.default;
  }

  private calculateTaxes(amount: number, country: string): number {
    const taxRates: Record<string, number> = {
      'España': 0.21, // IVA 21%
      'Portugal': 0.23,
      'Francia': 0.20,
      'default': 0.20,
    };
    
    const rate = taxRates[country] || taxRates.default;
    return amount * rate;
  }

  async findAllOrders(): Promise<Order[]> {
    return this.orderModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOrdersByUser(userId: string): Promise<Order[]> {
    return this.orderModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async findOrderById(id: string): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
    }
    return order;
  }

  async findOrderByNumber(orderNumber: string): Promise<Order> {
    const order = await this.orderModel.findOne({ orderNumber }).exec();
    if (!order) {
      throw new NotFoundException(`Pedido ${orderNumber} no encontrado`);
    }
    return order;
  }

  async updateOrder(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOrderById(id);
    
    // Si se está cambiando el estado, actualizar fechas correspondientes
    if (updateOrderDto.status) {
      if (updateOrderDto.status === OrderStatus.DELIVERED) {
        updateOrderDto['deliveredAt'] = new Date();
      } else if (updateOrderDto.status === OrderStatus.CANCELLED) {
        updateOrderDto['cancelledAt'] = new Date();
      }
    }

    const updatedOrder = await this.orderModel
      .findByIdAndUpdate(id, updateOrderDto, { new: true })
      .exec();

    if (!updatedOrder) {
      throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
    }

    return updatedOrder;
  }

  async cancelOrder(id: string, reason?: string): Promise<Order> {
    const order = await this.findOrderById(id);
    
    // Solo se pueden cancelar pedidos en ciertos estados
    if ([OrderStatus.SHIPPED, OrderStatus.DELIVERED].includes(order.status)) {
      throw new BadRequestException('No se puede cancelar un pedido ya enviado o entregado');
    }

    // Liberar stock reservado
    for (const item of order.items) {
      await this.releaseStock(item.productId.toString(), item.quantity);
    }

    return this.updateOrder(id, {
      status: OrderStatus.CANCELLED,
      cancellationReason: reason,
    });
  }

  async getOrderStats(userId?: string) {
    const filter = userId ? { userId } : {};
    
    const [total, pending, confirmed, processing, shipped, delivered, cancelled] = await Promise.all([
      this.orderModel.countDocuments(filter),
      this.orderModel.countDocuments({ ...filter, status: OrderStatus.PENDING }),
      this.orderModel.countDocuments({ ...filter, status: OrderStatus.CONFIRMED }),
      this.orderModel.countDocuments({ ...filter, status: OrderStatus.PROCESSING }),
      this.orderModel.countDocuments({ ...filter, status: OrderStatus.SHIPPED }),
      this.orderModel.countDocuments({ ...filter, status: OrderStatus.DELIVERED }),
      this.orderModel.countDocuments({ ...filter, status: OrderStatus.CANCELLED }),
    ]);

    // Calcular ingresos totales
    const revenueResult = await this.orderModel.aggregate([
      { $match: { ...filter, status: { $in: [OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED] } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    return {
      total,
      pending,
      confirmed,
      processing,
      shipped,
      delivered,
      cancelled,
      totalRevenue,
    };
  }

  // ==================== RABBITMQ METHODS ====================

  private async publishApprovalRequest(order: Order): Promise<void> {
    const approvalRequestEvent = {
      service: 'MERCHANDISING',
      entityId: (order as any)._id.toString(),
      entityType: 'order',
      requestedBy: order.userId,
      priority: order.totalAmount >= 500 ? 'HIGH' : 'MEDIUM',
      metadata: {
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        itemCount: order.items.length,
        customerEmail: order.customerEmail,
        shippingAddress: order.shippingAddress,
        items: order.items.map(item => ({
          productName: item.productName,
          quantity: item.quantity,
          totalPrice: item.totalPrice,
        })),
      },
    };

    console.log('🛒 Publicando solicitud de aprobación para pedido:', approvalRequestEvent);
    
    this.client.emit('approval.requested', approvalRequestEvent);
  }

  // ==================== RABBITMQ LISTENERS ====================

  @EventPattern('approval.granted')
  async handleApprovalGranted(@Payload() data: any): Promise<void> {
    console.log(
      '[MERCHANDISING] Merchandising Service: Aprobación concedida recibida:',
      data,
    );

    if (data.service === 'MERCHANDISING' && data.entityType === 'order') {
      try {
        const order = await this.findOrderById(data.entityId);

        if (order.status === OrderStatus.REQUIRES_APPROVAL) {
          await this.updateOrder(data.entityId, {
            status: OrderStatus.CONFIRMED,
            paymentStatus: PaymentStatus.PAID,
          });

          console.log(
            `[MERCHANDISING] Pedido ${data.entityId} confirmado automáticamente tras aprobación`,
          );
        }
      } catch (error) {
        console.error(
          '[MERCHANDISING] Error al procesar aprobación concedida:',
          error,
        );
      }
    }
  }

  @EventPattern('approval.rejected')
  async handleApprovalRejected(@Payload() data: any): Promise<void> {
    console.log('[MERCHANDISING] Merchandising Service: Aprobación rechazada recibida:', data);
    
    if (data.service === 'MERCHANDISING' && data.entityType === 'order') {
      try {
        const order = await this.findOrderById(data.entityId);
        
        if (order.status === OrderStatus.REQUIRES_APPROVAL) {
          await this.cancelOrder(data.entityId, data.comments || 'Rechazado por administración');
          
          console.log(`[MERCHANDISING] Pedido ${data.entityId} cancelado automáticamente tras rechazo`);
        }
      } catch (error) {
        console.error('[MERCHANDISING] Error al procesar aprobación rechazada:', error);
      }
    }
  }
}