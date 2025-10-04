import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import budgetService from '../services/budget.service';

export class BudgetController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const budgets = await budgetService.getAll(userId);
      res.json(budgets);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      const budget = await budgetService.getById(id, userId);
      res.json(budget);
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

      const budget = await budgetService.create(userId, data);
      res.status(201).json(budget);
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

      const budget = await budgetService.update(id, userId, data);
      res.json(budget);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      const result = await budgetService.delete(id, userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getProgress(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const progress = await budgetService.getProgress(userId);
      res.json(progress);
    } catch (error) {
      next(error);
    }
  }
}

export default new BudgetController();
