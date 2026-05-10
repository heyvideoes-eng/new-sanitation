import express from 'express';
import { db } from '../db/setup.js';
import { getFacilityHealthSummary } from '../services/analyticsService.js';

const router = express.Router();

// 1. Live Recommendation Engine (based on hygiene & wait times)
router.get('/recommendation', (req, res) => {
  try {
    const facilities = db.prepare('SELECT * FROM facilities').all() as any[];
    
    const candidates = facilities.map(f => {
      const summary = getFacilityHealthSummary(f.id);
      
      // Simple heuristic for best facility
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

// 2. Facilities List
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

