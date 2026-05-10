import express from 'express';
import { db } from '../db/setup';
import { getFacilityHealthSummary } from '../services/analyticsService';

const router = express.Router();

// 1. Neural Pick Recommendation Engine
router.get('/recommendation', (req, res) => {
  try {
    const { lat, lng } = req.query;
    const facilities = db.prepare('SELECT * FROM facilities').all() as any[];
    
    const candidates = facilities.map(f => {
      const summary = getFacilityHealthSummary(f.id);
      
      // Score: Cleanliness(50%) - Wait(30%) - Crowding(20%)
      const score = (summary.cleanliness_score * 0.5) - 
                    (summary.occupancy_rate * 25) - 
                    (Math.max(0, summary.time_since_last_clean_minutes - 120) * 0.05);
      
      return {
        ...f,
        health: summary,
        score
      };
    }).sort((a, b) => b.score - a.score);

    res.json({
      best: candidates[0],
      alternatives: candidates.slice(1, 4),
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Existing Facilities List (Updated with rich fields)
router.get('/', (req, res) => {
  try {
    const facilities = db.prepare('SELECT * FROM facilities').all() as any[];
    const enriched = facilities.map(f => ({
      ...f,
      health: getFacilityHealthSummary(f.id),
      is_accessible: true
    }));
    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
