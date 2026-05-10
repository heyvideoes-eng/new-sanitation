import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import morgan from 'morgan';

import { db, initDB } from './db/setup.js';
import { connectDB } from './db/mongo.js';
import { initSensorJob } from './jobs/sensorJob.js';
import { initPredictiveJob } from './jobs/predictiveJob.js';

import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import facilityRoutes from './routes/facilities.js';
import maintenanceRoutes from './routes/maintenance.js';
import budgetRoutes from './routes/budget.js';
import analyticsRoutes from './routes/analytics.js';
import feedbackRoutes from './routes/feedback.js';
import photoRoutes from './routes/photos.js';
import inspectionRoutes from './routes/inspections.js';
import devRoutes from './routes/dev.js';
import { authenticate } from './middleware/auth.js';
import fs from 'fs';

dotenv.config();

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Enable Socket.io debugging if in dev
if (process.env.NODE_ENV !== 'production') {
  process.env.DEBUG = 'socket.io:*';
}

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(morgan('dev'));
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Uploads
app.use('/uploads', express.static(uploadDir));

export const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
    skipMiddlewares: true,
  }
});

io.on('connection', (socket) => {
  console.log(`📡 [Socket] Client connected: ${socket.id}`);
  
  if (socket.recovered) {
    console.log(`🔄 [Socket] Session recovered for client: ${socket.id}`);
  }

  socket.on('disconnect', (reason) => {
    console.log(`📡 [Socket] Client disconnected: ${socket.id} (${reason})`);
  });
});

// Initialize DB and Jobs
initDB();
connectDB();
initSensorJob();
initPredictiveJob();

// 1. Basic Health Check
app.get('/api/health', (_req, res) => {
  res.json({ 
    name: 'SAAF Intelligence Gateway', 
    status: 'online', 
    version: '1.5.0',
    timestamp: new Date().toISOString()
  });
});

// 2. Debug Status Endpoint
app.get('/api/debug/status', (req, res) => {
  try {
    const stats = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      db: {
        facilities: db.prepare('SELECT COUNT(*) as count FROM facilities').get(),
        tasks: db.prepare('SELECT COUNT(*) as count FROM maintenance_tasks').get(),
        feedback: db.prepare('SELECT COUNT(*) as count FROM user_feedback').get(),
      },
      env: process.env.NODE_ENV || 'development'
    };
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: 'Debug status failed', message: err.message });
  }
});

// Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/dev', devRoutes);

// Static Hosting for Production
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '..', '..', 'client', 'dist');
  console.log(`Serving static files from: ${clientBuildPath}`);
  app.use(express.static(clientBuildPath));
  
  // Handle SPA routing - must be LAST
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) return res.status(404).json({ error: 'API route not found' });
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('🔥 [Internal Error]:', err);
  res.status(err.status || 500).json({
    error: true,
    message: err.message || 'An unexpected error occurred on the SAAF Gateway',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

httpServer.listen(port, () => {
  console.log(`🚀 SAAF Intelligence Gateway running on http://localhost:${port}`);
});
