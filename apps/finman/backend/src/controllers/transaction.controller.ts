import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import transactionService from '../services/transaction.service';

export class TransactionController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const transactions = await transactionService.getAll(userId);
      res.json(transactions);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      const transaction = await transactionService.getById(id, userId);
      res.json(transaction);
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const data = req.body;

      // Handle file upload
      if (req.file) {
        // Store relative path
        const relativePath = req.file.path.replace(/\\/g, '/').split('/uploads/')[1];
        data.receiptPath = relativePath;
      }

      // Convert amount to number
      if (typeof data.amount === 'string') {
        data.amount = parseFloat(data.amount);
      }

      const transaction = await transactionService.create(userId, data);
      res.status(201).json(transaction);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      const data = req.body;

      // Handle file upload
      if (req.file) {
        const relativePath = req.file.path.replace(/\\/g, '/').split('/uploads/')[1];
        data.receiptPath = relativePath;
      }

      // Convert amount to number if provided
      if (data.amount && typeof data.amount === 'string') {
        data.amount = parseFloat(data.amount);
      }

      const transaction = await transactionService.update(id, userId, data);
      res.json(transaction);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      const result = await transactionService.delete(id, userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const stats = await transactionService.getStats(userId);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
}

export default new TransactionController();
