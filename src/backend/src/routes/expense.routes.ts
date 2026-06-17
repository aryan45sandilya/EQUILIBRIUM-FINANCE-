import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as expenseService from '../services/expense.service';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(async (req, res) => {
  const { groupId, page, limit } = req.query;
  if (!groupId) { res.status(400).json({ success: false, error: 'groupId required' }); return; }
  const result = await expenseService.getGroupExpenses(groupId as string, req.user!.id, Number(page) || 1, Number(limit) || 20);
  res.json({ success: true, data: result });
}));

router.post('/', asyncHandler(async (req, res) => {
  const expense = await expenseService.createExpense(req.body, req.user!.id);
  res.status(201).json({ success: true, data: expense });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  await expenseService.deleteExpense(req.params.id, req.user!.id);
  res.json({ success: true });
}));

export default router;
