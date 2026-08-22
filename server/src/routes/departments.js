import { Router } from 'express';
import { db } from '../config/database.js';
import { departments } from '../db/schema.js';
import { authenticate } from '../middleware/auth-middleware.js';

const router = Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const list = await db.select().from(departments);
    res.json(list);
  } catch (err) {
    next(err);
  }
});

export default router;
