import express from 'express';
import { db } from '../db/setup.js';
import { getFacilityHealthSummary, getGlobalKPIs } from '../services/analyticsService.js';

const router = express.Router();

// 1. Global Overview KPI
router.get('/overview', (req, res) => {
  try {
    const kpis = getGlobalKPIs();
    res.json(kpis);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Rich Facility Cards for Dashboard
router.get('/facility-cards', (req, res) => {
  try {
    const facilities = db.prepare('SELECT * FROM facilities').all() as any[];
    const cards = facilities.map(f => {
      const summary = getFacilityHealthSummary(f.id);
      const rush = db.prepare('SELECT surge_in_mins, confidence_pct FROM predicted_rush WHERE facility_id = ? ORDER BY id DESC LIMIT 1').get(f.id) as any;
      const status = db.prepare('SELECT status FROM cleanliness_status WHERE facility_id = ? ORDER BY id DESC LIMIT 1').get(f.id) as any;

      return {
        facility_id: f.id,
        name: f.name,
        location: f.location,
        lat: f.lat,
        lng: f.lng,
        status: status?.status || 'GREEN',
        occupancy: { 
          current: Math.round(summary.occupancy_rate * 20), 
          total: f.total_stalls 
        },
        queue: { 
          wait_time_mins: Math.round(summary.time_since_last_clean_minutes / 10), // Mock wait time derivation
          pressure_level: summary.queue_pressure 
        },
        cleanliness_score: summary.cleanliness_score,
        last_cleaned_at: summary.last_cleaned_at,
        alerts_open_count: summary.alerts_open_count,
        rush_prediction: rush || { surge_in_mins: 15, confidence_pct: 75 },
        is_accessible: true
      };
    });
    res.json(cards);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Alerts Stream
router.get('/alerts-stream', (req, res) => {
  try {
    const alerts = db.prepare(`
      SELECT m.*, f.name as facility_name 
      FROM maintenance_tasks m
      JOIN facilities f ON m.facility_id = f.id
      ORDER BY m.id DESC LIMIT 20
    `).all();
    res.json(alerts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
