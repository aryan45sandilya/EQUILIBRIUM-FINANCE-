import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as analyticsService from '../services/analytics.service';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
router.use(authenticate);

// GET /api/analytics?groupId=xxx
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { groupId } = req.query;
    if (!groupId) { res.status(400).json({ success: false, error: 'groupId required' }); return; }
    const data = await analyticsService.getGroupAnalytics(groupId as string, req.user!.id);
    res.json({ success: true, data });
  })
);

export default router;
