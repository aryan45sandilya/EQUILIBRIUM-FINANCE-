import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import * as groupService from '../services/group.service';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
router.use(authenticate);

const createGroupSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  currency: z.string().length(3).default('INR'),
});

// GET /api/groups
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const groups = await groupService.getUserGroups(req.user!.id);
    res.json({ success: true, data: groups });
  })
);

// POST /api/groups
router.post(
  '/',
  validate(createGroupSchema),
  asyncHandler(async (req, res) => {
    const group = await groupService.createGroup(
      req.body.name,
      req.body.description,
      req.body.currency,
      req.user!.id
    );
    res.status(201).json({ success: true, data: group });
  })
);

// GET /api/groups/:id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const group = await groupService.getGroupById(req.params.id, req.user!.id);
    res.json({ success: true, data: group });
  })
);

// POST /api/groups/:id/members  — invite by email
router.post(
  '/:id/members',
  asyncHandler(async (req, res) => {
    const { email } = req.body;
    const member = await groupService.addMember(req.params.id, email, req.user!.id);
    res.status(201).json({ success: true, data: member });
  })
);

// GET /api/groups/:id/debts — simplified debt graph
router.get(
  '/:id/debts',
  asyncHandler(async (req, res) => {
    const debts = await groupService.getGroupDebts(req.params.id, req.user!.id);
    res.json({ success: true, data: debts });
  })
);

export default router;
