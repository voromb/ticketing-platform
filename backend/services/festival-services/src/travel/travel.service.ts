import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Trip, TripDocument } from './schemas/trip.schema';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';

@Injectable()
export class TravelService {
  constructor(@InjectModel(Trip.name) private tripModel: Model<TripDocument>) {}

  async create(createTripDto: CreateTripDto): Promise<Trip> {
    const createdTrip = new this.tripModel(createTripDto);
    return createdTrip.save();
  }

  async findAll(): Promise<Trip[]> {
    return this.tripModel.find({ isActive: true }).exec();
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
}
