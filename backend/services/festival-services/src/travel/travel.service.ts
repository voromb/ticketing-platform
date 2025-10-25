import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientProxy, EventPattern, Payload } from '@nestjs/microservices';
import { Model } from 'mongoose';
import { Trip, TripDocument } from './schemas/trip.schema';
import { Booking, BookingDocument, BookingStatus } from './schemas/booking.schema';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { ApprovalService } from '../approval/approval.service';

@Injectable()
export class TravelService {
  constructor(
    @InjectModel(Trip.name) private tripModel: Model<TripDocument>,
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
    private readonly approvalService: ApprovalService,
  ) {}

  async create(createTripDto: CreateTripDto): Promise<Trip> {
    const createdTrip = new this.tripModel(createTripDto);
    return createdTrip.save();
  }

  /**
   * Crear viaje con datos de compañía (para COMPANY_ADMIN)
   */
  async createWithCompany(createTripDto: CreateTripDto, admin: any): Promise<Trip> {
    const tripData = {
      ...createTripDto,
      companyId: admin.companyId,
      companyName: admin.companyName,
      region: admin.companyRegion,
      managedBy: admin.email,
      approvalStatus: 'PENDING',
      lastModifiedBy: admin.email,
    };

    const createdTrip = new this.tripModel(tripData);
    const saved = await createdTrip.save();

    // Crear solicitud de aprobación en PostgreSQL
    try {
      await this.approvalService.createApprovalRequest({
        resourceType: 'TRIP',
        resourceId: (saved as any)._id.toString(),
        resourceName: saved.name,
        companyId: admin.companyId,
        companyName: admin.companyName,
        requestedBy: admin.email,
        metadata: {
          region: admin.companyRegion,
          capacity: saved.capacity,
          vehicleType: saved.vehicleType,
        },
      });
      console.log(`[TRAVEL] Solicitud de aprobación creada para ${saved.name}`);
    } catch (error) {
      console.error('[TRAVEL] Error creando solicitud de aprobación:', error);
      // No fallar la creación del viaje si falla la aprobación
    }

    console.log(`[TRAVEL] Nuevo viaje creado por ${admin.email}, requiere aprobación`);
    return saved;
  }

  async findAll(): Promise<Trip[]> {
    return this.tripModel.find({ isActive: true }).exec();
  }

  async findByFestival(festivalId: string): Promise<Trip[]> {
    return this.tripModel.find({ 
      festivalId, 
      isActive: true 
    }).exec();
  }

  async findOne(id: string): Promise<Trip> {
    const trip = await this.tripModel.findById(id).exec();
    if (!trip) {
      throw new NotFoundException(`Viaje con ID ${id} no encontrado`);
    }
    return trip;
  }

  async update(id: string, updateTripDto: UpdateTripDto): Promise<Trip> {
    const updatedTrip = await this.tripModel
      .findByIdAndUpdate(id, updateTripDto, { new: true })
      .exec();

    if (!updatedTrip) {
      throw new NotFoundException(`Viaje con ID ${id} no encontrado`);
    }
    return updatedTrip;
  }

  async updateApprovalStatus(id: string, data: { approvalStatus: string; reviewedBy?: string; reviewedAt?: Date; rejectionReason?: string }): Promise<Trip> {
    const updatedTrip = await this.tripModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    
    if (!updatedTrip) {
      throw new NotFoundException(`Viaje con ID ${id} no encontrado`);
    }

    console.log(`[TRAVEL] Estado de aprobación actualizado: ${id} -> ${data.approvalStatus}`);
    return updatedTrip;
  }

  async remove(id: string): Promise<Trip> {
    const deletedTrip = await this.tripModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .exec();
    
    if (!deletedTrip) {
      throw new NotFoundException(`Viaje con ID ${id} no encontrado`);
    }
    return deletedTrip;
  }

  async getAvailableSeats(id: string): Promise<number> {
    const trip = await this.findOne(id);
    return trip.capacity - trip.bookedSeats;
  }

  // ==================== BOOKING METHODS ====================

  async createBooking(createBookingDto: CreateBookingDto): Promise<Booking> {
    const trip = await this.findOne(createBookingDto.tripId);
    
    // Verificar disponibilidad
    const availableSeats = await this.getAvailableSeats(createBookingDto.tripId);
    if (availableSeats < createBookingDto.seatsBooked) {
      throw new BadRequestException(
        `No hay suficientes asientos disponibles. Disponibles: ${availableSeats}, Solicitados: ${createBookingDto.seatsBooked}`
      );
    }

    // Calcular precio total
    const totalPrice = trip.price * createBookingDto.seatsBooked;

    // Determinar si requiere aprobación (grupos grandes o viajes especiales)
    const requiresApproval = createBookingDto.seatsBooked >= 10 || trip.requiresApproval;
    
    const bookingData = {
      ...createBookingDto,
      totalPrice,
      status: requiresApproval ? BookingStatus.REQUIRES_APPROVAL : BookingStatus.PENDING,
    };

    const createdBooking = new this.bookingModel(bookingData);
    const savedBooking = await createdBooking.save();

    // Actualizar asientos reservados del viaje
    await this.tripModel.findByIdAndUpdate(
      createBookingDto.tripId,
      { $inc: { bookedSeats: createBookingDto.seatsBooked } }
    );

    // Si requiere aprobación, publicar evento
    if (requiresApproval) {
      console.log('🚌 TRAVEL: Reserva requiere aprobación, publicando evento...', {
        bookingId: (savedBooking as any)._id.toString(),
        seatsBooked: createBookingDto.seatsBooked,
        requiresApproval
      });
      
      try {
        await this.publishApprovalRequest(savedBooking, trip);
        console.log(
          '[TRAVEL] TRAVEL: Evento approval.requested publicado exitosamente',
        );
      } catch (error) {
        console.error('[TRAVEL] TRAVEL: Error al publicar evento approval.requested:', error);
      }
    } else {
      console.log('[TRAVEL] TRAVEL: Reserva NO requiere aprobación', {
        seatsBooked: createBookingDto.seatsBooked,
        tripRequiresApproval: trip.requiresApproval,
      });
    }

    return savedBooking;
  }

  async findAllBookings(): Promise<Booking[]> {
    return this.bookingModel.find().populate('tripId').exec();
  }

  async findBookingsByTrip(tripId: string): Promise<Booking[]> {
    return this.bookingModel.find({ tripId }).populate('tripId').exec();
  }

  async findBookingsByUser(userId: string): Promise<Booking[]> {
    return this.bookingModel.find({ userId }).populate('tripId').exec();
  }

  async findBookingById(id: string): Promise<Booking> {
    const booking = await this.bookingModel.findById(id).populate('tripId').exec();
    if (!booking) {
      throw new NotFoundException(`Reserva con ID ${id} no encontrada`);
    }
    return booking;
  }

  async updateBooking(id: string, updateBookingDto: UpdateBookingDto): Promise<Booking> {
    const booking = await this.findBookingById(id);
    
    // Si se está cambiando el estado, actualizar fechas correspondientes
    if (updateBookingDto.status) {
      if (updateBookingDto.status === BookingStatus.CONFIRMED) {
        updateBookingDto['confirmedAt'] = new Date();
      } else if (updateBookingDto.status === BookingStatus.CANCELLED) {
        updateBookingDto['cancelledAt'] = new Date();
      }
    }

    const updatedBooking = await this.bookingModel
      .findByIdAndUpdate(id, updateBookingDto, { new: true })
      .populate('tripId')
      .exec();

    if (!updatedBooking) {
      throw new NotFoundException(`Reserva con ID ${id} no encontrada`);
    }

    return updatedBooking;
  }

  async confirmBooking(id: string): Promise<Booking> {
    return this.updateBooking(id, { 
      status: BookingStatus.CONFIRMED,
    });
  }

  async cancelBooking(id: string, reason?: string): Promise<Booking> {
    const booking = await this.findBookingById(id);
    
    // Liberar asientos del viaje
    await this.tripModel.findByIdAndUpdate(
      booking.tripId,
      { $inc: { bookedSeats: -booking.seatsBooked } }
    );

    return this.updateBooking(id, { 
      status: BookingStatus.CANCELLED,
      cancellationReason: reason,
    });
  }

  async getBookingStats(tripId?: string) {
    const filter = tripId ? { tripId } : {};
    
    const [total, pending, confirmed, cancelled, requiresApproval] = await Promise.all([
      this.bookingModel.countDocuments(filter),
      this.bookingModel.countDocuments({ ...filter, status: BookingStatus.PENDING }),
      this.bookingModel.countDocuments({ ...filter, status: BookingStatus.CONFIRMED }),
      this.bookingModel.countDocuments({ ...filter, status: BookingStatus.CANCELLED }),
      this.bookingModel.countDocuments({ ...filter, status: BookingStatus.REQUIRES_APPROVAL }),
    ]);

    return {
      total,
      pending,
      confirmed,
      cancelled,
      requiresApproval,
    };
  }

  // ==================== RABBITMQ METHODS ====================

  private async publishApprovalRequest(booking: Booking, trip: Trip): Promise<void> {
    const approvalRequestEvent = {
      service: 'TRAVEL',
      entityId: (booking as any)._id.toString(),
      entityType: 'booking',
      requestedBy: booking.userId,
      priority: booking.seatsBooked >= 20 ? 'HIGH' : 'MEDIUM',
      metadata: {
        tripName: trip.name,
        seatsBooked: booking.seatsBooked,
        totalPrice: booking.totalPrice,
        passengerName: booking.passengerName,
        passengerEmail: booking.passengerEmail,
        tripId: (trip as any)._id.toString(),
      },
    };

    console.log('🚌 Publicando solicitud de aprobación para reserva:', approvalRequestEvent);
    
    this.client.emit('approval.requested', approvalRequestEvent);
  }

  // ==================== RABBITMQ LISTENERS ====================

  @EventPattern('approval.granted')
  async handleApprovalGranted(@Payload() data: any): Promise<void> {
    console.log(
      '[TRAVEL] Travel Service: Aprobación concedida recibida:',
      data,
    );

    if (data.service === 'TRAVEL' && data.entityType === 'booking') {
      try {
        const booking = await this.findBookingById(data.entityId);

        if (booking.status === BookingStatus.REQUIRES_APPROVAL) {
          await this.confirmBooking(data.entityId);

          console.log(
            `[TRAVEL] Reserva ${data.entityId} confirmada automáticamente tras aprobación`,
          );
        }
      } catch (error) {
        console.error(
          '[TRAVEL] Error al procesar aprobación concedida:',
          error,
        );
      }
    }
  }

  @EventPattern('approval.rejected')
  async handleApprovalRejected(@Payload() data: any): Promise<void> {
    console.log('[TRAVEL] Travel Service: Aprobación rechazada recibida:', data);
    
    if (data.service === 'TRAVEL' && data.entityType === 'booking') {
      try {
        const booking = await this.findBookingById(data.entityId);
        
        if (booking.status === BookingStatus.REQUIRES_APPROVAL) {
          await this.cancelBooking(data.entityId, data.comments || 'Rechazado por administración');
          
          console.log(`[TRAVEL] Reserva ${data.entityId} cancelada automáticamente tras rechazo`);
        }
      } catch (error) {
        console.error('[TRAVEL] Error al procesar aprobación rechazada:', error);
      }
    }
  }
}
