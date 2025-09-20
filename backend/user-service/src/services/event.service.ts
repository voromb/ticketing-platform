import Event, { IEvent } from '../models/event.model';

interface SearchParams {
  query?: string;
  category?: string;
  date?: string;
}

class EventService {
  async getAllEvents(): Promise<IEvent[]> {
    try {
      const events = await Event.find({ status: 'published' })
        .sort({ date: 1 })
        .limit(50);
      return events;
    } catch (error) {
      throw error;
    }
  }

  async getEventById(id: string): Promise<IEvent | null> {
    try {
      const event = await Event.findById(id);
      return event;
    } catch (error) {
      throw error;
    }
  }

  async searchEvents(params: SearchParams): Promise<IEvent[]> {
    try {
      const query: any = { status: 'published' };
      
      if (params.query) {
        query.$or = [
          { name: { $regex: params.query, $options: 'i' } },
          { description: { $regex: params.query, $options: 'i' } }
        ];
      }
      
      if (params.category) {
        query.category = params.category;
      }
      
      if (params.date) {
        const searchDate = new Date(params.date);
        const nextDay = new Date(searchDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        query.date = {
          $gte: searchDate,
          $lt: nextDay
        };
      }
      
      const events = await Event.find(query)
        .sort({ date: 1 })
        .limit(20);
        
      return events;
    } catch (error) {
      throw error;
    }
  }

  async updateAvailableSeats(eventId: string, seatsToReduce: number): Promise<IEvent | null> {
    try {
      const event = await Event.findByIdAndUpdate(
        eventId,
        { $inc: { availableSeats: -seatsToReduce } },
        { new: true }
      );
      
      if (event && event.availableSeats === 0) {
        event.status = 'sold_out';
        await event.save();
      }
      
      return event;
    } catch (error) {
      throw error;
    }
  }
}

export default EventService;
export { EventService };