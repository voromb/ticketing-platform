"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const router = (0, express_1.Router)();
const controller = new controllers_1.TicketController();
router.post("/reserve", controller.reserveTickets);
router.post("/confirm/:ticketId", controller.confirmTicket);
router.get("/my/:userId", controller.getUserTickets);
router.get("/:ticketId", controller.getTicketById);
exports.default = router;
//# sourceMappingURL=ticket.routes.js.map