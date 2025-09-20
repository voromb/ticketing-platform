import { Router } from "express";
import { TicketController } from "../controllers";

const router = Router();
const controller = new TicketController();

router.post("/reserve", controller.reserveTickets);
router.post("/confirm/:ticketId", controller.confirmTicket);
router.get("/my/:userId", controller.getUserTickets);
router.get("/:ticketId", controller.getTicketById);

export default router;
