import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import morgan from 'morgan';
import fs from 'fs';

import { db, initDB } from './db/setup.js';
import { connectDB } from './db/mongo.js';
import { initSensorJob } from './jobs/sensorJob.js';

import authRoutes from './routes/auth.js';
import facilityRoutes from './routes/facilities.js';
import feedbackRoutes from './routes/feedback.js';
import photoRoutes from './routes/photos.js';
import analyticsRoutes from './routes/analytics.js';
import dashboardRoutes from './routes/dashboard.js';
import maintenanceRoutes from './routes/maintenance.js';
import inspectionRoutes from './routes/inspections.js';
import budgetRoutes from './routes/budget.js';
import devRoutes from './routes/dev.js';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config();

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const app = express();
const port = process.env.PORT || 4000;

app.use(morgan('dev'));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadDir));

export const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
    skipMiddlewares: true,
  }
});

io.on('connection', (socket) => {
  console.log(`📡 [Socket] Connected: ${socket.id}`);
});

// Initialize DB and Jobs
initDB();
connectDB();
initSensorJob();

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'SAAF Intelligence Gateway is running.', docs: '/api/health' });
});

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'online', 
    service: 'SAAF-Gateway',
    timestamp: new Date().toISOString()
  });
});

// Register Unified Routes
app.use('/api/auth', authRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/dev', devRoutes);

// Static Hosting for Production
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '..', '..', 'client', 'dist');
  const indexPath = path.join(clientBuildPath, 'index.html');
  
  app.use(express.static(clientBuildPath));
  
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) return res.status(404).json({ error: 'API not found' });
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(500).send('Client build missing');
    }
  });
}

// Error Handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('🔥 [Error]:', err);
  res.status(err.status || 500).json({
    error: true,
    message: err.message || 'Internal Gateway Error'
  });
});

httpServer.listen(port, () => {
  console.log(`🚀 SAAF Gateway running on port ${port}`);
});
