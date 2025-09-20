"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const router = (0, express_1.Router)();
const controller = new controllers_1.EventController();
router.get('/', controller.getAllEvents);
router.get('/:id', controller.getEventById);
router.get('/search', controller.searchEvents);
exports.default = router;
//# sourceMappingURL=event.routes.js.map