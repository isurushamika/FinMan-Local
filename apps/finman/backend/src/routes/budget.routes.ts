import { Router } from 'express';
import budgetController from '../controllers/budget.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes are protected
router.use(authMiddleware);

router.get('/', budgetController.getAll.bind(budgetController));
router.get('/progress', budgetController.getProgress.bind(budgetController));
router.get('/:id', budgetController.getById.bind(budgetController));
router.post('/', budgetController.create.bind(budgetController));
router.put('/:id', budgetController.update.bind(budgetController));
router.delete('/:id', budgetController.delete.bind(budgetController));

export default router;
