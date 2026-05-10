import express from 'express';
import { initDB } from '../db/setup.js';

const router = express.Router();

// POST /api/dev/reset
// Wipes and reseeds the entire database
router.post('/reset', async (req, res) => {
  try {
    console.log('🔄 [Dev] Resetting and Re-seeding database...');
    await initDB();
    res.json({ status: 'success', message: 'Database reset and seeded with fresh data' });
  } catch (error: any) {
    res.status(500).json({ error: 'Reset failed', message: error.message });
  }
});

// GET /api/dev/config
router.get('/config', (req, res) => {
  res.json({
    simulation_frequency: '10s',
    ammonia_threshold_red: 50,
    ammonia_threshold_amber: 20,
    version: '1.4.0'
  });
});

export default router;
