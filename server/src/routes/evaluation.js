import { Router } from 'express';
import { db } from '../config/database.js';
import { runEvaluation } from '../evaluation/runner.js';

const router = Router();
let cachedResults = null;

router.post('/run', async (req, res, next) => {
  try {
    const results = await runEvaluation(db);
    cachedResults = results;
    res.json(results);
  } catch (err) {
    next(err);
  }
});

router.get('/results', (req, res) => {
  if (!cachedResults) {
    return res.status(404).json({ error: 'No evaluation results found. Run an evaluation first.' });
  }
  res.json(cachedResults);
});

export default router;
