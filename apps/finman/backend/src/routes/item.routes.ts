import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import * as itemController from '../controllers/item.controller';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Item routes
router.post('/', itemController.create);
router.get('/', itemController.getAll);
router.put('/:id', itemController.update);
router.delete('/:id', itemController.remove);

// Bulk operations
router.post('/bulk', itemController.bulkCreate);

export default router;
