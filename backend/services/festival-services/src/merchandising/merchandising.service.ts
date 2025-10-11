import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class MerchandisingService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const productData = {
      ...createProductDto,
      stock: {
        total: createProductDto.totalStock,
        available: createProductDto.totalStock,
        reserved: 0
      }
    };
    
    const createdProduct = new this.productModel(productData);
    return createdProduct.save();
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
}