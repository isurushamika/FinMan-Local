import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { createItem, getItems, updateItem, deleteItem } from '../services/item.service';

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const item = await createItem(userId, req.body);
    res.status(201).json(item);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const items = await getItems(userId);
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const item = await updateItem(userId, id, req.body);
    res.json(item);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    await deleteItem(userId, id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Bulk create for data migration
export const bulkCreate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { items } = req.body;
    
    if (!Array.isArray(items)) {
      res.status(400).json({ message: 'Items must be an array' });
      return;
    }

    const created = await Promise.all(
      items.map(item => createItem(userId, item))
    );
    
    res.status(201).json(created);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
