import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as notifService from '../services/notification.service';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
router.use(authenticate);

// GET /api/notifications
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const unreadOnly = req.query.unread === 'true';
    const data = await notifService.getUserNotifications(req.user!.id, unreadOnly);
    console.log('[notifications] GET for userId:', req.user!.id, '| count:', data.length);
    res.json({ success: true, data });
  })
);

// PATCH /api/notifications/:id/read
router.patch(
  '/:id/read',
  asyncHandler(async (req, res) => {
    await notifService.markRead(req.params.id, req.user!.id);
    res.json({ success: true });
  })
);

// PATCH /api/notifications/read-all
router.patch(
  '/read-all',
  asyncHandler(async (req, res) => {
    await notifService.markAllRead(req.user!.id);
    res.json({ success: true });
  })
);

export default router;
