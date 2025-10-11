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
import { MerchandisingService } from './merchandising.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('merchandising')
@Controller('merchandising')
export class MerchandisingController {
  constructor(private readonly merchandisingService: MerchandisingService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo producto' })
  @ApiResponse({ status: 201, description: 'Producto creado exitosamente' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.merchandisingService.create(createProductDto);
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
}