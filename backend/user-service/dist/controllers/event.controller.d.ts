import { Request, Response } from "express";
declare class EventController {
    private eventService;
    constructor();
    getAllEvents: (req: Request, res: Response) => Promise<void>;
    getEventById: (req: Request, res: Response) => Promise<void>;
    searchEvents: (req: Request, res: Response) => Promise<void>;
}
export default EventController;
//# sourceMappingURL=event.controller.d.ts.map