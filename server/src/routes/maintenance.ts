import express from 'express';
import { db } from '../db/setup.js';
import { io } from '../index.js';

import { Facility, MaintenanceTask } from '../db/mongo.js';
import mongoose from 'mongoose';

const router = express.Router();

// 1. Create Maintenance Task
router.post('/create', async (req, res) => {
  try {
    const { facility_id, issue_reason, assigned_to, severity, cost_estimate } = req.body;
    
    // SQL Logic (Primary)
    const info = db.prepare(`
      INSERT INTO maintenance_tasks (facility_id, issue_reason, assigned_to, created_at, status, priority, cost_estimate)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(facility_id, issue_reason, assigned_to || 'UNASSIGNED', new Date().toISOString(), 'PENDING', severity || 'MEDIUM', cost_estimate || null);

    // MongoDB Logic (Parallel Persistence if connected)
    if (mongoose.connection.readyState === 1) {
      try {
        const mFac = await Facility.findOne({ name: new RegExp(facility_id, 'i') }); 
        await MaintenanceTask.create({
          facility_id: mFac?._id || new mongoose.Types.ObjectId(),
          issue_reason,
          status: 'PENDING',
          priority: severity || 'MEDIUM'
        });
      } catch (mErr) {
        console.warn('⚠️ [MongoDB] Sync failed');
      }
    }

    io.emit('maintenance_alert', {
      id: info.lastInsertRowid,
      facility_id,
      alert_type: 'MANUAL_TICKET',
      message: issue_reason,
      severity: severity || 'MEDIUM',
      timestamp: new Date().toISOString()
    });

    res.json({ id: info.lastInsertRowid, status: 'success' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Accept Task (Cleaner)
router.put('/:id/accept', (req, res) => {
  try {
    const { id } = req.params;
    
    db.prepare(`
      UPDATE maintenance_tasks 
      SET started_at = ?, status = 'IN_PROGRESS'
      WHERE id = ?
    `).run(new Date().toISOString(), id);

    res.json({ status: 'success' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Complete Task
router.put('/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const { cost_inr, photo, coords, notes } = req.body;
    
    const task = db.prepare('SELECT * FROM maintenance_tasks WHERE id = ?').get(id) as any;
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const facility = db.prepare('SELECT name FROM facilities WHERE id = ?').get(task.facility_id) as any;

    const completed_at = new Date().toISOString();
    const created_at = new Date(task.created_at);
    const response_time_mins = Math.floor((new Date(completed_at).getTime() - created_at.getTime()) / 60000);

    // Update Task (SQL)
    db.prepare(`
      UPDATE maintenance_tasks 
      SET completed_at = ?, status = 'COMPLETED', verification_photo = ?, location_coords = ?
      WHERE id = ?
    `).run(completed_at, photo, JSON.stringify(coords), id);

    // Log Budget
    const amount = cost_inr || 500;
    db.prepare(`
      INSERT INTO budget_log (task_id, facility_id, amount, category, description, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, task.facility_id, amount, 'repair', notes || 'Maintenance task completion', completed_at);

    // MongoDB Persistence (if connected)
    if (mongoose.connection.readyState === 1) {
      try {
        // Find the task in Mongo by some unique property or just skip if ID mismatch
        // For now, let's just log and skip to prevent crashes, or implement a proper mapping
        const mTask = await MaintenanceTask.findOne({ issue_reason: task.issue_reason });
        if (mTask) {
          mTask.status = 'COMPLETED';
          mTask.completed_at = new Date(completed_at);
          await mTask.save();
        }
      } catch (err) {
        console.warn('⚠️ [MongoDB] Completion sync failed');
      }
    }

    // Emit real-time update
    io.emit('maintenance_update', {
      task_id: id,
      facility_id: task.facility_id,
      facility_name: facility?.name,
      status: 'COMPLETED',
      photo,
      coords,
      completed_at
    });

    // Reset Facility Cleanliness
    db.prepare(`
      INSERT INTO cleanliness_status (facility_id, status, reason, updated_at)
      VALUES (?, 'GREEN', 'Sanitization completed', ?)
    `).run(task.facility_id, completed_at);

    res.json({ status: 'success', response_time_mins });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
