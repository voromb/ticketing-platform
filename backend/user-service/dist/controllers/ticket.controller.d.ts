import { Request, Response } from "express";
declare class TicketController {
    private ticketService;
    constructor();
    reserveTickets: (req: Request, res: Response) => Promise<void>;
    confirmTicket: (req: Request, res: Response) => Promise<void>;
    getUserTickets: (req: Request, res: Response) => Promise<void>;
    getTicketById: (req: Request, res: Response) => Promise<void>;
}
export default TicketController;
export { TicketController };
//# sourceMappingURL=ticket.controller.d.ts.map