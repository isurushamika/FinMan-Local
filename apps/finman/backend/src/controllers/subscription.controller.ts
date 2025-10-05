import { Request, Response, NextFunction } from 'express';
import * as subscriptionService from '../services/subscription.service';

export async function createSubscription(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId;
    const { name, amount, billingCycle, nextBillingDate, category, description, isActive, autoRenew } = req.body;

    if (!name || !amount || !billingCycle || !nextBillingDate || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const subscription = await subscriptionService.createSubscription({
      userId,
      name,
      amount: parseFloat(amount),
      billingCycle,
      nextBillingDate,
      category,
      description,
      isActive,
      autoRenew,
    });

    res.status(201).json(subscription);
  } catch (error) {
    next(error);
  }
}

export async function getSubscriptions(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId;
    const subscriptions = await subscriptionService.getSubscriptionsByUser(userId);
    res.json(subscriptions);
  } catch (error) {
    next(error);
  }
}

export async function getSubscription(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const subscription = await subscriptionService.getSubscriptionById(id, userId);

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.json(subscription);
  } catch (error) {
    next(error);
  }
}

export async function updateSubscription(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const { name, amount, billingCycle, nextBillingDate, category, description, isActive, autoRenew } = req.body;

    const subscription = await subscriptionService.updateSubscription(id, userId, {
      name,
      amount: amount ? parseFloat(amount) : undefined,
      billingCycle,
      nextBillingDate,
      category,
      description,
      isActive,
      autoRenew,
    });

    res.json(subscription);
  } catch (error) {
    next(error);
  }
}

export async function deleteSubscription(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    await subscriptionService.deleteSubscription(id, userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
