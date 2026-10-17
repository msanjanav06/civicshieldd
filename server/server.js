import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

import { initDatastore, getDbStatus } from './config/datastore.js';
import { logger } from './utils/logger.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import incidentRoutes from './routes/incidentRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { seedInitialData } from './seed/seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security and utility middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Serve uploaded photos statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = getDbStatus();
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    database: dbStatus
  });
});

// Rate limiting on API routes
app.use('/api', apiLimiter);

// Register REST API routes
app.use('/api/auth', authRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/uploads', uploadRoutes);

// Centralized error handler
app.use(errorHandler);

// Start server after datastore initializes
async function startServer() {
  try {
    await initDatastore();
    // Auto-seed initial demo accounts and simulated incidents if empty
    await seedInitialData();

    app.listen(PORT, () => {
      logger.info(`========================================================`);
      logger.info(`🛡️  CivicShield Municipal Operations Server Online`);
      logger.info(`📡 Port: ${PORT} | Mode: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 REST API Root: http://localhost:${PORT}/api`);
      logger.info(`========================================================`);
    });
  } catch (err) {
    logger.error('Fatal error during CivicShield server startup:', err);
    process.exit(1);
  }
}

startServer();
