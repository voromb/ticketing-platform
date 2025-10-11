import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Restaurant, RestaurantDocument } from './schemas/restaurant.schema';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectModel(Restaurant.name) private restaurantModel: Model<RestaurantDocument>
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
}