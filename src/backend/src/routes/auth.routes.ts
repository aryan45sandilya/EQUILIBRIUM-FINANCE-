import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// Auth is handled by Clerk — these routes are stubs
router.get('/me', asyncHandler(async (_req, res) => {
  res.json({ success: true });
}));

export default router;
