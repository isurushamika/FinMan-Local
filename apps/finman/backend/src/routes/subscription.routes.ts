import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import * as subscriptionController from '../controllers/subscription.controller';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Subscription routes
router.post('/', subscriptionController.createSubscription);
router.get('/', subscriptionController.getSubscriptions);
router.get('/:id', subscriptionController.getSubscription);
router.put('/:id', subscriptionController.updateSubscription);
router.delete('/:id', subscriptionController.deleteSubscription);

export default router;
