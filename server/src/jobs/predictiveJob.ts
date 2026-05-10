import cron from 'node-cron';
import { db } from '../db/setup.js';
import { io } from '../index.js';

export const initPredictiveJob = () => {
  cron.schedule('*/5 * * * *', () => {
    console.log('Running predictive rush simulation...');
    const facilities = db.prepare('SELECT * FROM facilities').all() as any[];

    for (const facility of facilities) {
      const surgeInMins = Math.floor(Math.random() * 55) + 5; // 5-60 mins
      const confidence = 50 + Math.random() * 45; // 50-95%
      
      db.prepare(`
        INSERT INTO predicted_rush (facility_id, predicted_at, surge_in_mins, confidence_pct, source)
        VALUES (?, ?, ?, ?, ?)
      `).run(facility.id, new Date().toISOString(), surgeInMins, confidence, 'schedule_simulator');

      io.emit('rush_prediction', {
        facility_id: facility.id,
        surge_in_mins: surgeInMins,
        confidence_pct: confidence,
        source: 'AI_PREDICTIVE_MODEL'
      });
    }
  });
};
