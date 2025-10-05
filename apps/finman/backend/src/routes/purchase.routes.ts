import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import * as purchaseController from '../controllers/purchase.controller';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Purchase routes
router.post('/', purchaseController.create);
router.get('/', purchaseController.getAll);
router.get('/item/:itemId', purchaseController.getByItem);
router.delete('/:id', purchaseController.remove);

// Bulk operations
router.post('/bulk', purchaseController.bulkCreate);

export default router;
