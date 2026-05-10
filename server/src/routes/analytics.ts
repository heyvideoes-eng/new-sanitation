import express from 'express';
import { db } from '../db/setup.js';
import { getGlobalKPIs } from '../services/analyticsService.js';

const router = express.Router();

// 1. Global Dashboard KPIs
router.get('/dashboard', (req, res) => {
  try {
    const kpis = getGlobalKPIs();
    res.json(kpis);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Heatmap (7x24 grid)
router.get('/heatmap', (req, res) => {
  try {
    const heatmap = [];
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        heatmap.push({
          day,
          hour,
          value: Math.floor(Math.random() * 100)
        });
      }
    }
    res.json(heatmap);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Trends (Occupancy, Cleanliness, Ratings)
router.get('/trends', (req, res) => {
  try {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    res.json({
      labels: days,
      occupancy: days.map(() => Math.floor(Math.random() * 100)),
      cleanliness: days.map(() => 70 + Math.random() * 30),
      satisfaction: days.map(() => 3.5 + Math.random() * 1.5),
      peak_hours: ["10:00", "14:00", "18:00"]
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Ward & Zone Performance
router.get('/wards/performance', (req, res) => {
  try {
    const wardStats = db.prepare(`
      SELECT 
        ward_number,
        zone,
        COUNT(*) as toilet_count,
        AVG(compliance_score) as avg_compliance,
        AVG(rating) as avg_rating,
        (SELECT COUNT(*) FROM user_feedback WHERE facility_id IN (SELECT id FROM facilities WHERE ward_number = f.ward_number)) as total_complaints
      FROM facilities f
      GROUP BY ward_number
    `).all();
    res.json(wardStats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Contractor Performance
router.get('/contracts/performance', (req, res) => {
  try {
    const contractStats = db.prepare(`
      SELECT 
        contractor_name,
        COUNT(*) as managed_facilities,
        AVG(compliance_score) as avg_score,
        (SELECT COUNT(*) FROM maintenance_tasks WHERE facility_id IN (SELECT id FROM facilities WHERE contractor_name = f.contractor_name) AND status = 'COMPLETED') as tasks_done
      FROM facilities f
      WHERE contractor_name IS NOT NULL
      GROUP BY contractor_name
    `).all();
    res.json(contractStats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
