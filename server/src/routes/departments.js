import { Router } from 'express';
import { db } from '../config/database.js';
import { departments } from '../db/schema.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const deps = await db.select().from(departments);
    res.json(deps);
  } catch (err) {
    next(err);
  }
});

export default router;
