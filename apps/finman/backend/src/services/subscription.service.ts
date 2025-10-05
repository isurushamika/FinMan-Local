import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createSubscription(data: {
  userId: string;
  name: string;
  amount: number;
  billingCycle: string;
  nextBillingDate: string;
  category: string;
  description?: string;
  isActive?: boolean;
  autoRenew?: boolean;
}) {
  return await prisma.subscription.create({
    data,
  });
}

export async function getSubscriptionsByUser(userId: string) {
  return await prisma.subscription.findMany({
    where: {
      userId,
    },
    orderBy: [
      { isActive: 'desc' },
      { nextBillingDate: 'asc' },
    ],
  });
}

export async function getSubscriptionById(id: string, userId: string) {
  const subscription = await prisma.subscription.findFirst({
    where: {
      id,
      userId,
    },
  });
  return subscription;
}

export async function updateSubscription(
  id: string,
  userId: string,
  data: {
    name?: string;
    amount?: number;
    billingCycle?: string;
    nextBillingDate?: string;
    category?: string;
    description?: string;
    isActive?: boolean;
    autoRenew?: boolean;
  }
) {
  return await prisma.subscription.update({
    where: {
      id,
    },
    data,
  });
}

export async function deleteSubscription(id: string, userId: string) {
  const subscription = await prisma.subscription.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!subscription) {
    throw new Error('Subscription not found');
  }

  return await prisma.subscription.delete({
    where: {
      id,
    },
  });
}
