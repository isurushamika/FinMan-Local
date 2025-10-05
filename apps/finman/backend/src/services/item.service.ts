import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ItemData {
  name: string;
  category: string;
  quantity?: number;
  unitPrice: number;
  notes?: string;
}

export const createItem = async (userId: string, data: ItemData) => {
  return await prisma.item.create({
    data: {
      userId,
      name: data.name,
      category: data.category,
      quantity: data.quantity || 0,
      unitPrice: data.unitPrice,
      notes: data.notes,
    },
  });
};

export const getItems = async (userId: string) => {
  return await prisma.item.findMany({
    where: { userId },
    include: {
      purchases: {
        orderBy: { purchaseDate: 'desc' },
        take: 10, // Last 10 purchases per item
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const updateItem = async (userId: string, id: string, data: Partial<ItemData>) => {
  // Verify ownership
  const item = await prisma.item.findFirst({
    where: { id, userId },
  });

  if (!item) {
    throw new Error('Item not found');
  }

  return await prisma.item.update({
    where: { id },
    data,
  });
};

export const deleteItem = async (userId: string, id: string) => {
  // Verify ownership
  const item = await prisma.item.findFirst({
    where: { id, userId },
  });

  if (!item) {
    throw new Error('Item not found');
  }

  // Deletes will cascade to purchases
  return await prisma.item.delete({
    where: { id },
  });
};
