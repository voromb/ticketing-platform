import { IEvent } from '../models/event.model';
interface SearchParams {
    query?: string;
    category?: string;
    date?: string;
}
declare class EventService {
    getAllEvents(): Promise<IEvent[]>;
    getEventById(id: string): Promise<IEvent | null>;
    searchEvents(params: SearchParams): Promise<IEvent[]>;
    updateAvailableSeats(eventId: string, seatsToReduce: number): Promise<IEvent | null>;
}
export default EventService;
export { EventService };
//# sourceMappingURL=event.service.d.ts.map