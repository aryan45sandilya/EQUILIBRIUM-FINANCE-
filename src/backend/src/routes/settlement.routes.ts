import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import * as settlementService from '../services/settlement.service';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
router.use(authenticate);

const createSettlementSchema = z.object({
  groupId: z.string(),
  toId: z.string(),
  amount: z.number().positive(),
  notes: z.string().max(500).optional(),
});

// GET /api/settlements?groupId=xxx
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { groupId } = req.query;
    if (!groupId) { res.status(400).json({ success: false, error: 'groupId required' }); return; }
    const data = await settlementService.getGroupSettlements(groupId as string, req.user!.id);
    res.json({ success: true, data });
  })
);

// POST /api/settlements
router.post(
  '/',
  validate(createSettlementSchema),
  asyncHandler(async (req, res) => {
    const { groupId, toId, amount, notes } = req.body;
    const data = await settlementService.createSettlement(
      groupId, req.user!.id, toId, amount, notes
    );
    res.status(201).json({ success: true, data });
  })
);

export default router;
