import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

export interface CreateBudgetData {
  category: string;
  amount: number;
  period: 'monthly' | 'yearly';
}

export interface UpdateBudgetData extends Partial<CreateBudgetData> {}

export class BudgetService {
  async getAll(userId: string) {
    const budgets = await prisma.budget.findMany({
      where: { userId },
      orderBy: { category: 'asc' },
    });

    return budgets;
  }

  async getById(id: string, userId: string) {
    const budget = await prisma.budget.findFirst({
      where: { id, userId },
    });

    if (!budget) {
      throw new AppError('Budget not found', 404);
    }

    return budget;
  }

  async create(userId: string, data: CreateBudgetData) {
    // Check if budget for category already exists
    const existing = await prisma.budget.findFirst({
      where: {
        userId,
        category: data.category,
        period: data.period,
      },
    });

    if (existing) {
      throw new AppError('Budget for this category and period already exists', 400);
    }

    const budget = await prisma.budget.create({
      data: {
        ...data,
        userId,
      },
    });

    return budget;
  }

  async update(id: string, userId: string, data: UpdateBudgetData) {
    // Check if budget exists and belongs to user
    await this.getById(id, userId);

    const budget = await prisma.budget.update({
      where: { id },
      data,
    });

    return budget;
  }

  async delete(id: string, userId: string) {
    // Check if budget exists and belongs to user
    await this.getById(id, userId);

    await prisma.budget.delete({
      where: { id },
    });

    return { message: 'Budget deleted successfully' };
  }

  async getProgress(userId: string) {
    const budgets = await this.getAll(userId);
    const transactions = await prisma.transaction.findMany({
      where: { userId, type: 'expense' },
    });

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const progress = budgets.map((budget) => {
      let spent = 0;

      if (budget.period === 'monthly') {
        spent = transactions
          .filter((t) => {
            const tDate = new Date(t.date);
            return (
              t.category === budget.category &&
              tDate.getMonth() === currentMonth &&
              tDate.getFullYear() === currentYear
            );
          })
          .reduce((sum, t) => sum + t.amount, 0);
      } else {
        // yearly
        spent = transactions
          .filter((t) => {
            const tDate = new Date(t.date);
            return (
              t.category === budget.category &&
              tDate.getFullYear() === currentYear
            );
          })
          .reduce((sum, t) => sum + t.amount, 0);
      }

      const percentage = (spent / budget.amount) * 100;
      const remaining = budget.amount - spent;

      return {
        ...budget,
        spent,
        remaining,
        percentage,
      };
    });

    return progress;
  }
}

export default new BudgetService();
