import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface PurchaseData {
  itemId: string;
  quantity: number;
  unitPrice: number;
  totalCost: number;
  purchaseDate: string;
  store?: string;
  notes?: string;
}

export const createPurchase = async (userId: string, data: PurchaseData) => {
  // Verify item ownership
  const item = await prisma.item.findFirst({
    where: { id: data.itemId, userId },
  });

  if (!item) {
    throw new Error('Item not found');
  }

  return await prisma.itemPurchase.create({
    data: {
      userId,
      itemId: data.itemId,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      totalCost: data.totalCost,
      purchaseDate: data.purchaseDate,
      store: data.store,
      notes: data.notes,
    },
    include: {
      item: true,
    },
  });
};

export const getPurchases = async (userId: string) => {
  return await prisma.itemPurchase.findMany({
    where: { userId },
    include: {
      item: true,
    },
    orderBy: { purchaseDate: 'desc' },
  });
};

export const getPurchasesByItem = async (userId: string, itemId: string) => {
  return await prisma.itemPurchase.findMany({
    where: { userId, itemId },
    include: {
      item: true,
    },
    orderBy: { purchaseDate: 'desc' },
  });
};

export const deletePurchase = async (userId: string, id: string) => {
  // Verify ownership
  const purchase = await prisma.itemPurchase.findFirst({
    where: { id, userId },
  });

  if (!purchase) {
    throw new Error('Purchase not found');
  }

  return await prisma.itemPurchase.delete({
    where: { id },
  });
};
