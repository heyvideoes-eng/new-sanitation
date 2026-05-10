import express from 'express';
import { db } from '../db/setup.js';
import { io } from '../index.js';

const router = express.Router();

router.post('/', (req, res) => {
  try {
    const { facility_id, rating, issue_type, comment, photo_url, lat, lng } = req.body;
    
    const timestamp = new Date().toISOString();
    
    const feedback = db.prepare(`
      INSERT INTO user_feedback (facility_id, rating, issue_type, comment, photo_url, lat, lng, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(facility_id, rating, issue_type || 'NONE', comment || '', photo_url || '', lat || null, lng || null, timestamp);

    const feedbackId = feedback.lastInsertRowid;

    // Logic: Auto-trigger maintenance task for low ratings
    if (rating <= 2) {
      console.log(`⚠️ [Feedback] Low rating detected for facility ${facility_id}. Auto-triggering task.`);
      
      const taskReason = issue_type !== 'NONE' ? `Citizen Report: ${issue_type}` : 'Low Rating Alert';
      const taskDesc = comment ? `Citizen Feedback: "${comment}"` : 'Facility received a very low rating. Immediate inspection required.';
      
      const task = db.prepare(`
        INSERT INTO maintenance_tasks (facility_id, status, priority, issue_reason, description, created_at)
        VALUES (?, 'PENDING', 'HIGH', ?, ?, ?)
      `).run(facility_id, taskReason, taskDesc, timestamp);

      // Emit Live Alert
      io.emit('maintenance_alert', {
        id: task.lastInsertRowid,
        facility_id,
        alert_type: 'CITIZEN_REPORT',
        message: taskReason,
        severity: 'HIGH',
        timestamp
      });
      
      // Update cleanliness status to RED if it was GREEN
      db.prepare(`
        INSERT INTO cleanliness_status (facility_id, status, reason, updated_at)
        VALUES (?, 'RED', ?, ?)
      `).run(facility_id, 'Multiple Citizen Complaints', timestamp);
      
      io.emit('status_change', {
        facility_id,
        new_status: 'RED',
        reason: 'Citizen Complaints'
      });
    }

    res.json({ 
      status: 'success', 
      feedback_id: feedbackId,
      task_triggered: rating <= 2 
    });
  } catch (error: any) {
    console.error('Feedback Error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
