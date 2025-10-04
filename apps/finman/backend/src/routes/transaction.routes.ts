import { Router } from 'express';
import transactionController from '../controllers/transaction.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';

const router = Router();

// All routes are protected
router.use(authMiddleware);

router.get('/', transactionController.getAll.bind(transactionController));
router.get('/stats', transactionController.getStats.bind(transactionController));
router.get('/:id', transactionController.getById.bind(transactionController));
router.post(
  '/',
  uploadMiddleware.single('receipt'),
  transactionController.create.bind(transactionController)
);
router.put(
  '/:id',
  uploadMiddleware.single('receipt'),
  transactionController.update.bind(transactionController)
);
router.delete('/:id', transactionController.delete.bind(transactionController));

export default router;
