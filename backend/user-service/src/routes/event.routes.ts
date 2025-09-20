import { Router } from 'express';
import { EventController } from '../controllers';

const router = Router();
const controller = new EventController();

router.get('/', controller.getAllEvents);
router.get('/:id', controller.getEventById);
router.get('/search', controller.searchEvents);

export default router;