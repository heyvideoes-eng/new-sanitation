import express from 'express';
import { db } from '../db/setup.js';
import { getAIInsights } from '../services/nvidia.js';

const router = express.Router();

router.get('/insights/:facilityId', async (req, res) => {
  try {
    const { facilityId } = req.params;
    
    // Get latest stats for this facility
    const facility = db.prepare('SELECT name FROM facilities WHERE id = ?').get(facilityId) as any;
    if (!facility) return res.status(404).json({ error: 'Facility not found' });

    const health = db.prepare(`
      SELECT status, reason FROM cleanliness_status 
      WHERE facility_id = ? 
      ORDER BY id DESC LIMIT 1
    `).get(facilityId) as any;

    const queue = db.prepare(`
      SELECT current_users, wait_time_mins FROM crowd_queue 
      WHERE facility_id = ? 
      ORDER BY id DESC LIMIT 1
    `).get(facilityId) as any;

    const stats = {
      cleanliness: health?.status === 'GREEN' ? 95 : (health?.status === 'AMBER' ? 65 : 30),
      occupancy: queue?.current_users || 0,
      wait_time: queue?.wait_time_mins || 0
    };

    const insight = await getAIInsights(facility.name, stats);

    res.json({
      facility_id: facilityId,
      facility_name: facility.name,
      insight,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('AI Route Error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
