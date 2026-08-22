import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { errorHandler } from './src/middleware/error-handler.js';
import authRouter from './src/routes/auth.js';
import complaintsRouter from './src/routes/complaints.js';
import departmentsRouter from './src/routes/departments.js';
import mockAuthorityRouter from './src/routes/mock-authority.js';
import evaluationRouter from './src/routes/evaluation.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: function (origin, callback) {
    // For Vercel deployments, be forgiving with origins to prevent strict-equality crashes
    // if the user accidentally added a trailing slash to CLIENT_URL.
    callback(null, true); 
  },
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
// Local file uploads are disabled in favor of Base64 strings in the DB
// to perfectly support Vercel serverless deployments.

app.use('/api/auth', authRouter);
app.use('/api/complaints', complaintsRouter);
app.use('/api/departments', departmentsRouter);
app.use('/mock', mockAuthorityRouter);
app.use('/api/evaluation', evaluationRouter);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use(errorHandler);

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`CivicFix server running on port ${PORT}`));
}

export default app;
