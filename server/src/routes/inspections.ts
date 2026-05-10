import express from 'express';
import { db } from '../db/setup.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// POST /api/inspections/submit
router.post('/submit', (req, res) => {
  try {
    const { facility_id, inspector_id, score, checklist, notes } = req.body;

    const info = db.prepare(`
      INSERT INTO inspection_reports (facility_id, inspector_id, score, checklist_json, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      facility_id,
      inspector_id || 1, // Fallback to default admin/inspector
      score,
      JSON.stringify(checklist),
      notes || '',
      new Date().toISOString()
    );

    // Update facility compliance score
    db.prepare('UPDATE facilities SET compliance_score = ? WHERE id = ?').run(score, facility_id);

    res.status(201).json({
      id: info.lastInsertRowid,
      message: 'Inspection report submitted successfully',
      compliance_score: score
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to submit inspection', message: err.message });
  }
});

// GET /api/inspections/facility/:id
router.get('/facility/:id', (req, res) => {
  try {
    const reports = db.prepare(`
      SELECT r.*, u.name as inspector_name 
      FROM inspection_reports r
      LEFT JOIN users u ON r.inspector_id = u.id
      WHERE r.facility_id = ? 
      ORDER BY r.created_at DESC
    `).all(req.params.id);
    res.json(reports);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch inspections' });
  }
});

// GET /api/inspections/summary
router.get('/summary', (req, res) => {
  try {
    const summary = db.prepare(`
      SELECT 
        COUNT(*) as total_inspections,
        AVG(score) as avg_score,
        (SELECT name FROM facilities WHERE id = r.facility_id) as facility_name
      FROM inspection_reports r
      GROUP BY facility_id
    `).all();
    res.json(summary);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

export default router;
