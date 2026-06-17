import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { randomUUID } from 'crypto';
import fs from 'fs';
import { authenticate } from '../middleware/auth.middleware';
import { supabase } from '../lib/supabase';
import { AppError } from '../middleware/errorHandler';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
router.use(authenticate);

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => cb(null, `${randomUUID()}${path.extname(file.originalname)}`),
});

const upload = multer({
  storage,
  limits: { fileSize: (Number(process.env.MAX_FILE_SIZE_MB) || 5) * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new AppError('File type not allowed', 400));
  },
});

router.post('/receipt/:expenseId', upload.single('receipt'), asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('No file uploaded', 400);

  const { data: expense } = await supabase.from('expenses').select('id').eq('id', req.params.expenseId).single();
  if (!expense) throw new AppError('Expense not found', 404);

  const url = `/uploads/${req.file.filename}`;
  await supabase.from('receipts').upsert({
    expense_id: req.params.expenseId,
    uploaded_by: req.user!.id,
    url,
    filename: req.file.originalname,
    mime_type: req.file.mimetype,
    size: req.file.size,
  });

  res.status(201).json({ success: true, data: { url } });
}));

export default router;
