import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { TravelService } from './travel.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { AdminOnly, AuthenticatedOnly, Public } from '../auth/decorators/auth.decorators';

@ApiTags('travel')
@Controller('travel')
export class TravelController {
  constructor(private readonly travelService: TravelService) {}

  @Post()
  @AdminOnly() // Solo admins pueden crear viajes
  @ApiOperation({ summary: 'Crear un nuevo viaje' })
  @ApiResponse({ status: 201, description: 'Viaje creado exitosamente' })
  create(@Body() createTripDto: CreateTripDto) {
    return this.travelService.create(createTripDto);
  }

  @Get()
  @Public() // Cualquiera puede ver viajes disponibles
  @ApiOperation({ summary: 'Obtener todos los viajes activos' })
  @ApiResponse({ status: 200, description: 'Lista de viajes' })
  findAll() {
    return this.travelService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un viaje por ID' })
  @ApiResponse({ status: 200, description: 'Viaje encontrado' })
  @ApiResponse({ status: 404, description: 'Viaje no encontrado' })
  findOne(@Param('id') id: string) {
    return this.travelService.findOne(id);
  }

  @Get(':id/available-seats')
  @ApiOperation({ summary: 'Obtener asientos disponibles' })
  @ApiResponse({ status: 200, description: 'Número de asientos disponibles' })
  async getAvailableSeats(@Param('id') id: string) {
    const seats = await this.travelService.getAvailableSeats(id);
    return { availableSeats: seats };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un viaje' })
  @ApiResponse({ status: 200, description: 'Viaje actualizado' })
  @ApiResponse({ status: 404, description: 'Viaje no encontrado' })
  update(@Param('id') id: string, @Body() updateTripDto: UpdateTripDto) {
    return this.travelService.update(id, updateTripDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un viaje (soft delete)' })
  @ApiResponse({ status: 204, description: 'Viaje eliminado' })
  @ApiResponse({ status: 404, description: 'Viaje no encontrado' })
  remove(@Param('id') id: string) {
    return this.travelService.remove(id);
  }

  // ==================== BOOKING ENDPOINTS ====================

  @Post('bookings')
  @AuthenticatedOnly() // Usuarios autenticados pueden hacer reservas
  @ApiOperation({ summary: 'Crear una nueva reserva' })
  @ApiResponse({ status: 201, description: 'Reserva creada exitosamente' })
  @ApiResponse({ status: 400, description: 'No hay asientos disponibles o datos inválidos' })
  createBooking(@Body() createBookingDto: CreateBookingDto) {
    return this.travelService.createBooking(createBookingDto);
  }

  @Get('bookings')
  @AdminOnly() // Solo admins pueden ver todas las reservas
  @ApiOperation({ summary: 'Obtener todas las reservas' })
  @ApiQuery({ name: 'tripId', required: false, description: 'Filtrar por ID de viaje' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filtrar por ID de usuario' })
  @ApiResponse({ status: 200, description: 'Lista de reservas' })
  findAllBookings(
    @Query('tripId') tripId?: string,
    @Query('userId') userId?: string,
  ) {
    if (tripId) {
      return this.travelService.findBookingsByTrip(tripId);
    }
    if (userId) {
      return this.travelService.findBookingsByUser(userId);
    }
    return this.travelService.findAllBookings();
  }

  @Get('bookings/stats')
  @ApiOperation({ summary: 'Obtener estadísticas de reservas' })
  @ApiQuery({ name: 'tripId', required: false, description: 'Estadísticas de un viaje específico' })
  @ApiResponse({ status: 200, description: 'Estadísticas de reservas' })
  getBookingStats(@Query('tripId') tripId?: string) {
    return this.travelService.getBookingStats(tripId);
  }

  @Get('bookings/:id')
  @ApiOperation({ summary: 'Obtener una reserva por ID' })
  @ApiResponse({ status: 200, description: 'Reserva encontrada' })
  @ApiResponse({ status: 404, description: 'Reserva no encontrada' })
  findBookingById(@Param('id') id: string) {
    return this.travelService.findBookingById(id);
  }

  @Patch('bookings/:id')
  @ApiOperation({ summary: 'Actualizar una reserva' })
  @ApiResponse({ status: 200, description: 'Reserva actualizada' })
  @ApiResponse({ status: 404, description: 'Reserva no encontrada' })
  updateBooking(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
  ) {
    return this.travelService.updateBooking(id, updateBookingDto);
  }

  @Post('bookings/:id/confirm')
  @ApiOperation({ summary: 'Confirmar una reserva' })
  @ApiResponse({ status: 200, description: 'Reserva confirmada' })
  @ApiResponse({ status: 404, description: 'Reserva no encontrada' })
  confirmBooking(@Param('id') id: string) {
    return this.travelService.confirmBooking(id);
  }

  @Post('bookings/:id/cancel')
  @ApiOperation({ summary: 'Cancelar una reserva' })
  @ApiResponse({ status: 200, description: 'Reserva cancelada' })
  @ApiResponse({ status: 404, description: 'Reserva no encontrada' })
  cancelBooking(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.travelService.cancelBooking(id, reason);
  }
}
