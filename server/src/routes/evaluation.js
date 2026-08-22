import { Router } from 'express';
import { db } from '../config/database.js';
import { runEvaluation } from '../evaluation/runner.js';
import { authenticate, authorize } from '../middleware/auth-middleware.js';

const router = Router();
let cachedResults = null;

router.post('/run', authenticate, authorize('management', 'operator', 'admin'), async (req, res, next) => {
  try {
    const results = await runEvaluation(db);
    cachedResults = results;
    res.json(results);
  } catch (err) {
    next(err);
  }
});

router.get('/results', authenticate, authorize('management', 'operator', 'admin'), (req, res) => {
  if (!cachedResults) {
    return res.status(404).json({ error: 'No evaluation results found. Run an evaluation first.' });
  }
  res.json(cachedResults);
});

export default router;
