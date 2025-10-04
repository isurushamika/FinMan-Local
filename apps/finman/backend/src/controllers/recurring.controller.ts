import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import recurringService from '../services/recurring.service';

export class RecurringController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const recurring = await recurringService.getAll(userId);
      res.json(recurring);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      const recurring = await recurringService.getById(id, userId);
      res.json(recurring);
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const data = req.body;

      // Convert amount to number
      if (typeof data.amount === 'string') {
        data.amount = parseFloat(data.amount);
      }

      // Convert isActive to boolean
      if (typeof data.isActive === 'string') {
        data.isActive = data.isActive === 'true';
      }

      const recurring = await recurringService.create(userId, data);
      res.status(201).json(recurring);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      const data = req.body;

      // Convert amount to number if provided
      if (data.amount && typeof data.amount === 'string') {
        data.amount = parseFloat(data.amount);
      }

      // Convert isActive to boolean if provided
      if (data.isActive !== undefined && typeof data.isActive === 'string') {
        data.isActive = data.isActive === 'true';
      }

      const recurring = await recurringService.update(id, userId, data);
      res.json(recurring);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      const result = await recurringService.delete(id, userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async processRecurring(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const transactions = await recurringService.processRecurring(userId);
      res.json({
        message: 'Recurring transactions processed',
        count: transactions.length,
        transactions,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new RecurringController();
