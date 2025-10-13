import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientProxy, EventPattern, Payload } from '@nestjs/microservices';
import { Model } from 'mongoose';
import { Restaurant, RestaurantDocument } from './schemas/restaurant.schema';
import { Reservation, ReservationDocument, ReservationStatus } from './schemas/reservation.schema';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectModel(Restaurant.name) private restaurantModel: Model<RestaurantDocument>,
    @InjectModel(Reservation.name) private reservationModel: Model<ReservationDocument>,
    @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
  ) {}

  async create(createRestaurantDto: CreateRestaurantDto): Promise<Restaurant> {
    const createdRestaurant = new this.restaurantModel(createRestaurantDto);
    return createdRestaurant.save();
  }

  async findAll(): Promise<Restaurant[]> {
    return this.restaurantModel.find({ isActive: true }).exec();
  }

  async findByFestival(festivalId: string): Promise<Restaurant[]> {
    return this.restaurantModel.find({ 
      festivalId, 
      isActive: true 
    }).exec();
  }

  async findOne(id: string): Promise<Restaurant> {
    const restaurant = await this.restaurantModel.findById(id).exec();
    if (!restaurant) {
      throw new NotFoundException(`Restaurante con ID ${id} no encontrado`);
    }
    return restaurant;
  }

  async update(id: string, updateRestaurantDto: UpdateRestaurantDto): Promise<Restaurant> {
    const updatedRestaurant = await this.restaurantModel
      .findByIdAndUpdate(id, updateRestaurantDto, { new: true })
      .exec();
    
    if (!updatedRestaurant) {
      throw new NotFoundException(`Restaurante con ID ${id} no encontrado`);
    }
    return updatedRestaurant;
  }

  async remove(id: string): Promise<Restaurant> {
    const deletedRestaurant = await this.restaurantModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .exec();
    
    if (!deletedRestaurant) {
      throw new NotFoundException(`Restaurante con ID ${id} no encontrado`);
    }
    return deletedRestaurant;
  }

  async getAvailableCapacity(id: string): Promise<number> {
    const restaurant = await this.findOne(id);
    return restaurant.capacity - restaurant.currentOccupancy;
  }

  async updateOccupancy(id: string, change: number): Promise<Restaurant> {
    const restaurant = await this.findOne(id);
    const newOccupancy = restaurant.currentOccupancy + change;
    
    if (newOccupancy > restaurant.capacity) {
      throw new Error('Capacidad máxima excedida');
    }
    
    if (newOccupancy < 0) {
      throw new Error('La ocupación no puede ser negativa');
    }

    const updatedRestaurant = await this.restaurantModel
      .findByIdAndUpdate(
        id, 
        { 
          currentOccupancy: newOccupancy,
          status: newOccupancy >= restaurant.capacity ? 'FULL' : 'OPEN'
        }, 
        { new: true }
      )
      .exec();

    if (!updatedRestaurant) {
      throw new NotFoundException(`Restaurante con ID ${id} no encontrado`);
    }

    return updatedRestaurant;
  }

  // ==================== RESERVATION METHODS ====================

  async createReservation(createReservationDto: CreateReservationDto): Promise<Reservation> {
    const restaurant = await this.findOne(createReservationDto.restaurantId);
    
    // Convertir string a Date
    const reservationDate = new Date(createReservationDto.reservationDate);
    
    // Verificar que la fecha no sea en el pasado
    if (reservationDate < new Date()) {
      throw new BadRequestException('No se pueden hacer reservas para fechas pasadas');
    }

    // Verificar disponibilidad en esa franja horaria
    const isAvailable = await this.checkAvailability(
      createReservationDto.restaurantId,
      reservationDate,
      createReservationDto.duration || 120,
      createReservationDto.partySize
    );

    if (!isAvailable) {
      throw new BadRequestException(
        `No hay disponibilidad para ${createReservationDto.partySize} personas en la fecha solicitada`
      );
    }

    // Determinar si requiere aprobación (grupos grandes o horarios especiales)
    const requiresApproval = createReservationDto.partySize >= 8 || this.isSpecialTime(reservationDate);
    
    const reservationData = {
      ...createReservationDto,
      reservationDate,
      duration: createReservationDto.duration || 120,
      status: requiresApproval ? ReservationStatus.REQUIRES_APPROVAL : ReservationStatus.PENDING,
    };

    const createdReservation = new this.reservationModel(reservationData);
    const savedReservation = await createdReservation.save();

    // Actualizar ocupación temporal del restaurante
    await this.updateOccupancy(createReservationDto.restaurantId, createReservationDto.partySize);

    // Si requiere aprobación, publicar evento
    if (requiresApproval) {
      await this.publishApprovalRequest(savedReservation, restaurant);
    }

    return savedReservation;
  }

  async checkAvailability(
    restaurantId: string, 
    reservationDate: Date, 
    duration: number, 
    partySize: number
  ): Promise<boolean> {
    const restaurant = await this.findOne(restaurantId);
    
    // Calcular ventana de tiempo (1 hora antes y después)
    const startTime = new Date(reservationDate.getTime() - 60 * 60 * 1000);
    const endTime = new Date(reservationDate.getTime() + (duration + 60) * 60 * 1000);

    // Buscar reservas existentes en esa ventana
    const existingReservations = await this.reservationModel.find({
      restaurantId,
      reservationDate: { $gte: startTime, $lte: endTime },
      status: { $in: [ReservationStatus.CONFIRMED, ReservationStatus.PENDING] }
    });

    // Calcular ocupación total en esa franja
    const totalOccupancy = existingReservations.reduce((sum, res) => sum + res.partySize, 0);
    
    return (totalOccupancy + partySize) <= restaurant.capacity;
  }

  private isSpecialTime(date: Date): boolean {
    const hour = date.getHours();
    const day = date.getDay(); // 0 = domingo, 6 = sábado
    
    // Horarios especiales: viernes/sábado noche, o muy tarde/temprano
    return (day === 5 || day === 6) && (hour >= 21 || hour <= 12) || hour >= 23 || hour <= 11;
  }

  async findAllReservations(): Promise<Reservation[]> {
    return this.reservationModel.find().populate('restaurantId').exec();
  }

  async findReservationsByRestaurant(restaurantId: string): Promise<Reservation[]> {
    return this.reservationModel.find({ restaurantId }).populate('restaurantId').exec();
  }

  async findReservationsByUser(userId: string): Promise<Reservation[]> {
    return this.reservationModel.find({ userId }).populate('restaurantId').exec();
  }

  async findReservationById(id: string): Promise<Reservation> {
    const reservation = await this.reservationModel.findById(id).populate('restaurantId').exec();
    if (!reservation) {
      throw new NotFoundException(`Reserva con ID ${id} no encontrada`);
    }
    return reservation;
  }

  async updateReservation(id: string, updateReservationDto: UpdateReservationDto): Promise<Reservation> {
    const reservation = await this.findReservationById(id);
    
    // Si se está cambiando el estado, actualizar fechas correspondientes
    if (updateReservationDto.status) {
      if (updateReservationDto.status === ReservationStatus.CONFIRMED) {
        updateReservationDto['confirmedAt'] = new Date();
      } else if (updateReservationDto.status === ReservationStatus.CANCELLED) {
        updateReservationDto['cancelledAt'] = new Date();
      } else if (updateReservationDto.status === ReservationStatus.COMPLETED) {
        updateReservationDto['completedAt'] = new Date();
      }
    }

    const updatedReservation = await this.reservationModel
      .findByIdAndUpdate(id, updateReservationDto, { new: true })
      .populate('restaurantId')
      .exec();

    if (!updatedReservation) {
      throw new NotFoundException(`Reserva con ID ${id} no encontrada`);
    }

    return updatedReservation;
  }

  async confirmReservation(id: string, tableNumber?: number): Promise<Reservation> {
    const updateData: any = { status: ReservationStatus.CONFIRMED };
    if (tableNumber) {
      updateData.tableNumber = tableNumber;
    }
    
    return this.updateReservation(id, updateData);
  }

  async cancelReservation(id: string, reason?: string): Promise<Reservation> {
    const reservation = await this.findReservationById(id);
    
    // Liberar ocupación del restaurante
    await this.updateOccupancy(reservation.restaurantId.toString(), -reservation.partySize);

    return this.updateReservation(id, { 
      status: ReservationStatus.CANCELLED,
      cancellationReason: reason,
    });
  }

  async completeReservation(id: string, actualPrice?: number): Promise<Reservation> {
    const updateData: any = { status: ReservationStatus.COMPLETED };
    if (actualPrice) {
      updateData.actualPrice = actualPrice;
    }
    
    return this.updateReservation(id, updateData);
  }

  async getReservationStats(restaurantId?: string) {
    const filter = restaurantId ? { restaurantId } : {};
    
    const [total, pending, confirmed, cancelled, completed, requiresApproval] = await Promise.all([
      this.reservationModel.countDocuments(filter),
      this.reservationModel.countDocuments({ ...filter, status: ReservationStatus.PENDING }),
      this.reservationModel.countDocuments({ ...filter, status: ReservationStatus.CONFIRMED }),
      this.reservationModel.countDocuments({ ...filter, status: ReservationStatus.CANCELLED }),
      this.reservationModel.countDocuments({ ...filter, status: ReservationStatus.COMPLETED }),
      this.reservationModel.countDocuments({ ...filter, status: ReservationStatus.REQUIRES_APPROVAL }),
    ]);

    return {
      total,
      pending,
      confirmed,
      cancelled,
      completed,
      requiresApproval,
    };
  }

  async getAvailableSlots(restaurantId: string, date: string): Promise<any[]> {
    const restaurant = await this.findOne(restaurantId);
    const targetDate = new Date(date);
    
    // Generar slots de 30 minutos desde las 12:00 hasta las 23:30
    const slots: any[] = [];
    for (let hour = 12; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slotTime = new Date(targetDate);
        slotTime.setHours(hour, minute, 0, 0);
        
        const isAvailable = await this.checkAvailability(restaurantId, slotTime, 120, 1);
        
        slots.push({
          time: slotTime.toISOString(),
          available: isAvailable,
          displayTime: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        });
      }
    }
    
    return slots;
  }

  // ==================== RABBITMQ METHODS ====================

  private async publishApprovalRequest(reservation: Reservation, restaurant: Restaurant): Promise<void> {
    const approvalRequestEvent = {
      service: 'RESTAURANT',
      entityId: (reservation as any)._id.toString(),
      entityType: 'reservation',
      requestedBy: reservation.userId,
      priority: reservation.partySize >= 12 ? 'HIGH' : 'MEDIUM',
      metadata: {
        restaurantName: restaurant.name,
        partySize: reservation.partySize,
        reservationDate: reservation.reservationDate,
        customerName: reservation.customerName,
        customerEmail: reservation.customerEmail,
        specialRequests: reservation.specialRequests,
        restaurantId: (restaurant as any)._id.toString(),
      },
    };

    console.log('🍽️ Publicando solicitud de aprobación para reserva:', approvalRequestEvent);
    
    this.client.emit('approval.requested', approvalRequestEvent);
  }

  // ==================== RABBITMQ LISTENERS ====================

  @EventPattern('approval.granted')
  async handleApprovalGranted(@Payload() data: any): Promise<void> {
    console.log('✅ Restaurant Service: Aprobación concedida recibida:', data);
    
    if (data.service === 'RESTAURANT' && data.entityType === 'reservation') {
      try {
        const reservation = await this.findReservationById(data.entityId);
        
        if (reservation.status === ReservationStatus.REQUIRES_APPROVAL) {
          await this.confirmReservation(data.entityId);
          
          console.log(`✅ Reserva ${data.entityId} confirmada automáticamente tras aprobación`);
        }
      } catch (error) {
        console.error('❌ Error al procesar aprobación concedida:', error);
      }
    }
  }

  @EventPattern('approval.rejected')
  async handleApprovalRejected(@Payload() data: any): Promise<void> {
    console.log('❌ Restaurant Service: Aprobación rechazada recibida:', data);
    
    if (data.service === 'RESTAURANT' && data.entityType === 'reservation') {
      try {
        const reservation = await this.findReservationById(data.entityId);
        
        if (reservation.status === ReservationStatus.REQUIRES_APPROVAL) {
          await this.cancelReservation(data.entityId, data.comments || 'Rechazado por administración');
          
          console.log(`❌ Reserva ${data.entityId} cancelada automáticamente tras rechazo`);
        }
      } catch (error) {
        console.error('❌ Error al procesar aprobación rechazada:', error);
      }
    }
  }
}