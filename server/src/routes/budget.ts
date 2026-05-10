import express from 'express';
import { db } from '../db/setup.js';

const router = express.Router();

// GET /api/budget (Legacy/Combined)
router.get('/', (req, res) => {
  try {
    const { from, to, facilityId } = req.query;
    
    let query = `
      SELECT b.*, f.name as facility_name
      FROM budget_log b
      JOIN facilities f ON b.facility_id = f.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (from) { query += " AND b.created_at >= ?"; params.push(from); }
    if (to) { query += " AND b.created_at <= ?"; params.push(to); }
    if (facilityId) { query += " AND f.id = ?"; params.push(facilityId); }

    const logs = db.prepare(query).all(...params);

    const summary = db.prepare(`
      SELECT 
        SUM(amount) as total_spend,
        COUNT(*) as tasks_completed,
        AVG(amount) as avg_cost
      FROM budget_log
    `).get() as any;

    res.json({
      summary: {
        total_spend: summary.total_spend || 0,
        tasks_completed: summary.tasks_completed || 0,
        avg_response: 20 // Mock for legacy
      },
      logs
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/budget/summary
router.get('/summary', (req, res) => {
  try {
    const { ward, facility_id } = req.query;
    let query = `
      SELECT 
        SUM(amount) as total_spent,
        COUNT(*) as total_tasks,
        AVG(amount) as avg_cost_per_task
      FROM budget_log b
      JOIN facilities f ON b.facility_id = f.id
      WHERE 1=1
    `;
    const params = [];

    if (ward) {
      query += ` AND f.ward_number = ?`;
      params.push(ward);
    }
    if (facility_id) {
      query += ` AND f.id = ?`;
      params.push(facility_id);
    }

    const summary = db.prepare(query).get(...params);
    res.json(summary);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/budget/line-items
router.get('/line-items', (req, res) => {
  try {
    const { ward, facility_id } = req.query;
    let query = `
      SELECT 
        b.*, 
        f.name as facility_name,
        f.ward_number
      FROM budget_log b
      JOIN facilities f ON b.facility_id = f.id
      WHERE 1=1
    `;
    const params = [];

    if (ward) {
      query += ` AND f.ward_number = ?`;
      params.push(ward);
    }
    if (facility_id) {
      query += ` AND f.id = ?`;
      params.push(facility_id);
    }

    query += ` ORDER BY b.created_at DESC LIMIT 50`;
    
    const items = db.prepare(query).all(...params);
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/budget/vendor-summary
router.get('/vendor-summary', (req, res) => {
  try {
    const vendors = db.prepare(`
      SELECT 
        f.contractor_name,
        SUM(b.amount) as total_spend,
        COUNT(b.id) as task_count,
        AVG(f.compliance_score) as avg_sla_score
      FROM budget_log b
      JOIN facilities f ON b.facility_id = f.id
      WHERE f.contractor_name IS NOT NULL
      GROUP BY f.contractor_name
    `).all();
    res.json(vendors);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
