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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { RestaurantService } from './restaurant.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';

@ApiTags('restaurant')
@Controller('restaurant')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo restaurante' })
  @ApiResponse({ status: 201, description: 'Restaurante creado exitosamente' })
  create(@Body() createRestaurantDto: CreateRestaurantDto) {
    return this.restaurantService.create(createRestaurantDto);
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
  @ApiOperation({ summary: 'Actualizar un restaurante' })
  @ApiResponse({ status: 200, description: 'Restaurante actualizado' })
  @ApiResponse({ status: 404, description: 'Restaurante no encontrado' })
  update(@Param('id') id: string, @Body() updateRestaurantDto: UpdateRestaurantDto) {
    return this.restaurantService.update(id, updateRestaurantDto);
  }

  @Patch(':id/occupancy')
  @ApiOperation({ summary: 'Actualizar ocupación del restaurante' })
  @ApiResponse({ status: 200, description: 'Ocupación actualizada' })
  updateOccupancy(@Param('id') id: string, @Body('change') change: number) {
    return this.restaurantService.updateOccupancy(id, change);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un restaurante (soft delete)' })
  @ApiResponse({ status: 204, description: 'Restaurante eliminado' })
  @ApiResponse({ status: 404, description: 'Restaurante no encontrado' })
  remove(@Param('id') id: string) {
    return this.restaurantService.remove(id);
  }
}