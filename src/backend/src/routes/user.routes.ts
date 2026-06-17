import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { supabase } from '../lib/supabase';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
router.use(authenticate);

router.get('/me', asyncHandler(async (req, res) => {
  const { data } = await supabase.from('users').select('id, name, email, avatar, currency, created_at').eq('id', req.user!.id).single();
  res.json({ success: true, data });
}));

router.patch('/me', asyncHandler(async (req, res) => {
  const { name, currency, avatar } = req.body;
  const { data } = await supabase.from('users').update({ name, currency, avatar }).eq('id', req.user!.id).select('id, name, email, avatar, currency').single();
  res.json({ success: true, data });
}));

export default router;
