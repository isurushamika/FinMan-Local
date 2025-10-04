import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

export interface CreateRecurringData {
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  account?: string;
  isActive: boolean;
}

export interface UpdateRecurringData extends Partial<CreateRecurringData> {}

export class RecurringService {
  async getAll(userId: string) {
    const recurring = await prisma.recurringTransaction.findMany({
      where: { userId },
      orderBy: { nextDate: 'asc' },
    });

    return recurring;
  }

  async getById(id: string, userId: string) {
    const recurring = await prisma.recurringTransaction.findFirst({
      where: { id, userId },
    });

    if (!recurring) {
      throw new AppError('Recurring transaction not found', 404);
    }

    return recurring;
  }

  async create(userId: string, data: CreateRecurringData) {
    const nextDate = this.calculateNextDate(data.startDate, data.frequency);

    const recurring = await prisma.recurringTransaction.create({
      data: {
        ...data,
        userId,
        nextDate,
      },
    });

    return recurring;
  }

  async update(id: string, userId: string, data: UpdateRecurringData) {
    // Check if recurring exists and belongs to user
    const existing = await this.getById(id, userId);

    // Recalculate nextDate if frequency or startDate changed
    let nextDate = existing.nextDate;
    if (data.frequency || data.startDate) {
      const frequency = data.frequency || existing.frequency;
      const startDate = data.startDate || existing.startDate;
      nextDate = this.calculateNextDate(startDate, frequency);
    }

    const recurring = await prisma.recurringTransaction.update({
      where: { id },
      data: {
        ...data,
        nextDate,
      },
    });

    return recurring;
  }

  async delete(id: string, userId: string) {
    // Check if recurring exists and belongs to user
    await this.getById(id, userId);

    await prisma.recurringTransaction.delete({
      where: { id },
    });

    return { message: 'Recurring transaction deleted successfully' };
  }

  async processRecurring(userId: string) {
    const now = new Date();
    const recurring = await prisma.recurringTransaction.findMany({
      where: {
        userId,
        isActive: true,
        nextDate: {
          lte: now.toISOString(),
        },
      },
    });

    const createdTransactions = [];

    for (const rec of recurring) {
      // Create transaction
      const transaction = await prisma.transaction.create({
        data: {
          userId,
          type: rec.type,
          amount: rec.amount,
          category: rec.category,
          description: rec.description || undefined,
          date: rec.nextDate,
          account: rec.account || undefined,
          recurringId: rec.id,
        },
      });

      createdTransactions.push(transaction);

      // Update nextDate
      const newNextDate = this.calculateNextDate(rec.nextDate, rec.frequency);
      await prisma.recurringTransaction.update({
        where: { id: rec.id },
        data: { nextDate: newNextDate },
      });
    }

    return createdTransactions;
  }

  private calculateNextDate(currentDate: string, frequency: string): string {
    const date = new Date(currentDate);

    switch (frequency) {
      case 'daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
    }

    return date.toISOString();
  }
}

export default new RecurringService();
