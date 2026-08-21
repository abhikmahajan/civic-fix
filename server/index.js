import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { errorHandler } from './src/middleware/error-handler.js';
import complaintsRouter from './src/routes/complaints.js';
import departmentsRouter from './src/routes/departments.js';
import mockAuthorityRouter from './src/routes/mock-authority.js';
import evaluationRouter from './src/routes/evaluation.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map(origin => origin.trim());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS'));
  }
}));
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/complaints', complaintsRouter);
app.use('/api/departments', departmentsRouter);
app.use('/mock', mockAuthorityRouter);
app.use('/api/evaluation', evaluationRouter);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use(errorHandler);

app.listen(PORT, () => console.log(`CivicFix server running on port ${PORT}`));
 
