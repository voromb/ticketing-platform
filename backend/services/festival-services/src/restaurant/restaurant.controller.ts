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
import { RestaurantService } from './restaurant.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { CompanyAdminGuard } from '../auth/guards/company-admin.guard';
import { CompanyPermissionGuard } from '../auth/guards/company-permission.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentCompanyAdmin } from '../auth/decorators/current-company-admin.decorator';

@ApiTags('restaurant')
@Controller('restaurant')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Post()
  @UseGuards(CompanyAdminGuard, CompanyPermissionGuard)
  @RequirePermissions('canCreate')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un nuevo restaurante (requiere autenticación COMPANY_ADMIN)' })
  @ApiResponse({ status: 201, description: 'Restaurante creado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  create(
    @Body() createRestaurantDto: CreateRestaurantDto,
    @CurrentCompanyAdmin() admin: any,
  ) {
    return this.restaurantService.createWithCompany(createRestaurantDto, admin);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas de restaurantes' })
  @ApiResponse({ status: 200, description: 'Estadísticas de restaurantes' })
  async getStats() {
    const restaurants = await this.restaurantService.findAll();
    const totalRestaurants = restaurants.length;
    const totalCapacity = restaurants.reduce((sum, r) => sum + (r.capacity || 0), 0);
    const currentOccupancy = restaurants.reduce((sum, r) => sum + (r.currentOccupancy || 0), 0);
    const activeRestaurants = restaurants.filter(r => r.isActive && r.status === 'OPEN').length;
    const pendingApproval = restaurants.filter(r => r.approvalStatus === 'PENDING').length;

    return {
      totalRestaurants,
      activeRestaurants,
      totalCapacity,
      currentOccupancy,
      availableCapacity: totalCapacity - currentOccupancy,
      pendingApproval,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los restaurantes' })
  @ApiQuery({ name: 'festivalId', required: false })
  @ApiResponse({ status: 200, description: 'Lista de restaurantes' })
  findAll(@Query('festivalId') festivalId?: string) {
    if (festivalId) {
      return this.restaurantService.findByFestival(festivalId);
    }
    return this.restaurantService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un restaurante por ID' })
  @ApiResponse({ status: 200, description: 'Restaurante encontrado' })
  @ApiResponse({ status: 404, description: 'Restaurante no encontrado' })
  findOne(@Param('id') id: string) {
    return this.restaurantService.findOne(id);
  }

  @Get(':id/capacity')
  @ApiOperation({ summary: 'Obtener capacidad disponible' })
  @ApiResponse({ status: 200, description: 'Capacidad disponible' })
  async getAvailableCapacity(@Param('id') id: string) {
    const capacity = await this.restaurantService.getAvailableCapacity(id);
    return { availableCapacity: capacity };
  }

  @Patch(':id')
  @UseGuards(CompanyAdminGuard, CompanyPermissionGuard)
  @RequirePermissions('canUpdate')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un restaurante (requiere autenticación COMPANY_ADMIN)' })
  @ApiResponse({ status: 200, description: 'Restaurante actualizado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  @ApiResponse({ status: 404, description: 'Restaurante no encontrado' })
  update(
    @Param('id') id: string,
    @Body() updateRestaurantDto: UpdateRestaurantDto,
    @CurrentCompanyAdmin() admin: any,
  ) {
    return this.restaurantService.update(id, updateRestaurantDto);
  }

  @Patch(':id/occupancy')
  @ApiOperation({ summary: 'Actualizar ocupación del restaurante' })
  @ApiResponse({ status: 200, description: 'Ocupación actualizada' })
  updateOccupancy(@Param('id') id: string, @Body('change') change: number) {
    return this.restaurantService.updateOccupancy(id, change);
  }

  @Patch(':id/approval-status')
  @ApiOperation({ summary: 'Actualizar estado de aprobación del restaurante' })
  @ApiResponse({ status: 200, description: 'Estado actualizado' })
  updateApprovalStatus(
    @Param('id') id: string,
    @Body() body: { approvalStatus: string; reviewedBy?: string; reviewedAt?: Date; rejectionReason?: string }
  ) {
    return this.restaurantService.updateApprovalStatus(id, body);
  }

  @Delete(':id')
  @UseGuards(CompanyAdminGuard, CompanyPermissionGuard)
  @RequirePermissions('canDelete')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un restaurante (requiere autenticación COMPANY_ADMIN)' })
  @ApiResponse({ status: 204, description: 'Restaurante eliminado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  @ApiResponse({ status: 404, description: 'Restaurante no encontrado' })
  remove(
    @Param('id') id: string,
    @CurrentCompanyAdmin() admin: any,
  ) {
    return this.restaurantService.remove(id);
  }

  // ==================== RESERVATION ENDPOINTS ====================

  @Post('reservations')
  @ApiOperation({ summary: 'Crear una nueva reserva' })
  @ApiResponse({ status: 201, description: 'Reserva creada exitosamente' })
  @ApiResponse({ status: 400, description: 'No hay disponibilidad o datos inválidos' })
  createReservation(@Body() createReservationDto: CreateReservationDto) {
    return this.restaurantService.createReservation(createReservationDto);
  }

  @Get('reservations')
  @ApiOperation({ summary: 'Obtener todas las reservas' })
  @ApiQuery({ name: 'restaurantId', required: false, description: 'Filtrar por ID de restaurante' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filtrar por ID de usuario' })
  @ApiResponse({ status: 200, description: 'Lista de reservas' })
  findAllReservations(
    @Query('restaurantId') restaurantId?: string,
    @Query('userId') userId?: string,
  ) {
    if (restaurantId) {
      return this.restaurantService.findReservationsByRestaurant(restaurantId);
    }
    if (userId) {
      return this.restaurantService.findReservationsByUser(userId);
    }
    return this.restaurantService.findAllReservations();
  }

  @Get('reservations/stats')
  @ApiOperation({ summary: 'Obtener estadísticas de reservas' })
  @ApiQuery({ name: 'restaurantId', required: false, description: 'Estadísticas de un restaurante específico' })
  @ApiResponse({ status: 200, description: 'Estadísticas de reservas' })
  getReservationStats(@Query('restaurantId') restaurantId?: string) {
    return this.restaurantService.getReservationStats(restaurantId);
  }

  @Get(':id/available-slots')
  @ApiOperation({ summary: 'Obtener horarios disponibles para un día' })
  @ApiQuery({ name: 'date', required: true, description: 'Fecha en formato YYYY-MM-DD' })
  @ApiResponse({ status: 200, description: 'Lista de horarios disponibles' })
  getAvailableSlots(
    @Param('id') restaurantId: string,
    @Query('date') date: string,
  ) {
    return this.restaurantService.getAvailableSlots(restaurantId, date);
  }

  @Get('reservations/:id')
  @ApiOperation({ summary: 'Obtener una reserva por ID' })
  @ApiResponse({ status: 200, description: 'Reserva encontrada' })
  @ApiResponse({ status: 404, description: 'Reserva no encontrada' })
  findReservationById(@Param('id') id: string) {
    return this.restaurantService.findReservationById(id);
  }

  @Patch('reservations/:id')
  @ApiOperation({ summary: 'Actualizar una reserva' })
  @ApiResponse({ status: 200, description: 'Reserva actualizada' })
  @ApiResponse({ status: 404, description: 'Reserva no encontrada' })
  updateReservation(
    @Param('id') id: string,
    @Body() updateReservationDto: UpdateReservationDto,
  ) {
    return this.restaurantService.updateReservation(id, updateReservationDto);
  }

  @Post('reservations/:id/confirm')
  @ApiOperation({ summary: 'Confirmar una reserva' })
  @ApiResponse({ status: 200, description: 'Reserva confirmada' })
  @ApiResponse({ status: 404, description: 'Reserva no encontrada' })
  confirmReservation(
    @Param('id') id: string,
    @Body('tableNumber') tableNumber?: number,
  ) {
    return this.restaurantService.confirmReservation(id, tableNumber);
  }

  @Post('reservations/:id/cancel')
  @ApiOperation({ summary: 'Cancelar una reserva' })
  @ApiResponse({ status: 200, description: 'Reserva cancelada' })
  @ApiResponse({ status: 404, description: 'Reserva no encontrada' })
  cancelReservation(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.restaurantService.cancelReservation(id, reason);
  }

  @Post('reservations/:id/complete')
  @ApiOperation({ summary: 'Marcar reserva como completada' })
  @ApiResponse({ status: 200, description: 'Reserva completada' })
  @ApiResponse({ status: 404, description: 'Reserva no encontrada' })
  completeReservation(
    @Param('id') id: string,
    @Body('actualPrice') actualPrice?: number,
  ) {
    return this.restaurantService.completeReservation(id, actualPrice);
  }
}