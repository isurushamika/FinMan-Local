import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { createPurchase, getPurchases, getPurchasesByItem, deletePurchase } from '../services/purchase.service';

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const purchase = await createPurchase(userId, req.body);
    res.status(201).json(purchase);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const purchases = await getPurchases(userId);
    res.json(purchases);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getByItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { itemId } = req.params;
    const purchases = await getPurchasesByItem(userId, itemId);
    res.json(purchases);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    await deletePurchase(userId, id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Bulk create for data migration
export const bulkCreate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { purchases } = req.body;
    
    if (!Array.isArray(purchases)) {
      res.status(400).json({ message: 'Purchases must be an array' });
      return;
    }

    const created = await Promise.all(
      purchases.map(purchase => createPurchase(userId, purchase))
    );
    
    res.status(201).json(created);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
