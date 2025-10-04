import { Router } from 'express';
import recurringController from '../controllers/recurring.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes are protected
router.use(authMiddleware);

router.get('/', recurringController.getAll.bind(recurringController));
router.get('/:id', recurringController.getById.bind(recurringController));
router.post('/', recurringController.create.bind(recurringController));
router.post('/process', recurringController.processRecurring.bind(recurringController));
router.put('/:id', recurringController.update.bind(recurringController));
router.delete('/:id', recurringController.delete.bind(recurringController));

export default router;
