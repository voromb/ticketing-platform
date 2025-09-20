import { ITicket } from "../models/ticket.model";
interface ReserveTicketDto {
    eventId: string;
    userId: string;
    seats: string[];
}
declare class TicketService {
    private eventService;
    constructor();
    reserveTickets(data: ReserveTicketDto): Promise<ITicket>;
    confirmTicket(ticketId: string): Promise<ITicket | null>;
    getUserTickets(userId: string): Promise<ITicket[]>;
    getTicketById(ticketId: string): Promise<ITicket | null>;
}
export default TicketService;
export { TicketService };
//# sourceMappingURL=ticket.service.d.ts.map