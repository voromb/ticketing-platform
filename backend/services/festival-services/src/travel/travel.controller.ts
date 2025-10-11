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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TravelService } from './travel.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';

@ApiTags('travel')
@Controller('travel')
export class TravelController {
  constructor(private readonly travelService: TravelService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo viaje' })
  @ApiResponse({ status: 201, description: 'Viaje creado exitosamente' })
  create(@Body() createTripDto: CreateTripDto) {
    return this.travelService.create(createTripDto);
  }

  @Get()
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
}
