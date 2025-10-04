import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';
import { deleteFile } from '../middleware/upload.middleware';
import path from 'path';

const prisma = new PrismaClient();

export interface CreateTransactionData {
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description?: string;
  date: string;
  account?: string;
  receiptPath?: string;
  recurringId?: string;
}

export interface UpdateTransactionData extends Partial<CreateTransactionData> {}

export class TransactionService {
  async getAll(userId: string) {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    return transactions;
  }

  async getById(id: string, userId: string) {
    const transaction = await prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    return transaction;
  }

  async create(userId: string, data: CreateTransactionData) {
    const transaction = await prisma.transaction.create({
      data: {
        ...data,
        userId,
      },
    });

    return transaction;
  }

  async update(id: string, userId: string, data: UpdateTransactionData) {
    // Check if transaction exists and belongs to user
    const existing = await this.getById(id, userId);

    const transaction = await prisma.transaction.update({
      where: { id },
      data,
    });

    return transaction;
  }

  async delete(id: string, userId: string) {
    // Check if transaction exists and belongs to user
    const transaction = await this.getById(id, userId);

    // Delete receipt file if exists
    if (transaction.receiptPath) {
      const uploadDir = process.env.UPLOAD_DIR || './uploads';
      const fullPath = path.join(uploadDir, transaction.receiptPath);
      deleteFile(fullPath);
    }

    await prisma.transaction.delete({
      where: { id },
    });

    return { message: 'Transaction deleted successfully' };
  }

  async getStats(userId: string) {
    const transactions = await this.getAll(userId);

    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpense;

    return {
      totalIncome,
      totalExpense,
      balance,
      transactionCount: transactions.length,
    };
  }
}

export default new TransactionService();
