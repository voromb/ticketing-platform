import { Router } from 'express';
import EventController from '../controllers/event.controller';

const router = Router();
const controller = new EventController();

// EVENTOS VIA API CALLS - Consulta al admin backend (PostgreSQL)
router.get('/', controller.getAllEvents);
router.get('/search', controller.searchEvents);
router.get('/:id/availability', controller.checkAvailability);
router.get('/:id', controller.getEventById);

export default router;