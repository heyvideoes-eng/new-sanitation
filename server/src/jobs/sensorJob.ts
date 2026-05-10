import cron from 'node-cron';
import { db } from '../db/setup.js';
import { io } from '../index.js';

export const initSensorJob = () => {
  cron.schedule('*/10 * * * * *', () => {
    console.log('Running sensor simulation...');
    const facilities = db.prepare('SELECT * FROM facilities').all() as any[];

    for (const facility of facilities) {
      // 1. Randomly toggle stall occupancy
      const stalls = db.prepare('SELECT * FROM stall_status WHERE facility_id = ?').all(facility.id) as any[];
      for (const stall of stalls) {
        if (Math.random() > 0.8) {
          const newStatus = stall.is_occupied === 1 ? 0 : 1;
          db.prepare('UPDATE stall_status SET is_occupied = ?, last_updated = ? WHERE id = ?')
            .run(newStatus, new Date().toISOString(), stall.id);
        }
      }

      // 2. Randomize sensor readings
      const ammonia = Math.random() * 60; // 0-60 ppm
      const humidity = 30 + Math.random() * 60; // 30-90%
      const floor_wet = Math.random() > 0.95 ? 1 : 0;
      const tissue = Math.max(0, (Math.random() > 0.9 ? 100 : (Math.random() * 100))); // occasional refill simulation
      const soap = Math.max(0, (Math.random() > 0.9 ? 100 : (Math.random() * 100)));

      db.prepare(`
        INSERT INTO sensor_readings (facility_id, ammonia_level, humidity, floor_wet, flush_count, tissue_level, soap_level, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(facility.id, ammonia, humidity, floor_wet, 1, tissue, soap, new Date().toISOString());

      // 3. Compute Cleanliness Status
      let status = 'GREEN';
      let reason = 'All systems optimal';

      if (ammonia > 50 || floor_wet === 1 || tissue < 15 || soap < 15) {
        status = 'RED';
        reason = ammonia > 50 ? 'Critical ammonia levels' : floor_wet === 1 ? 'Flooding detected' : 'Critical supplies low';
      } else if (ammonia >= 20 || humidity >= 60 || tissue < 40 || soap < 40) {
        status = 'AMBER';
        reason = 'Attention required: check supplies or air quality';
      }

      const lastStatus = db.prepare('SELECT status FROM cleanliness_status WHERE facility_id = ? ORDER BY id DESC LIMIT 1').get(facility.id) as any;
      
      if (!lastStatus || lastStatus.status !== status) {
        db.prepare('INSERT INTO cleanliness_status (facility_id, status, reason, updated_at) VALUES (?, ?, ?, ?)')
          .run(facility.id, status, reason, new Date().toISOString());
        
        io.emit('status_change', {
          facility_id: facility.id,
          old_status: lastStatus?.status || 'UNKNOWN',
          new_status: status,
          reason
        });
      }

      // 4. Update Queue
      const occupiedStalls = stalls.filter(s => s.is_occupied === 1).length;
      const currentUsers = occupiedStalls + Math.floor(Math.random() * 5);
      const waitTime = (currentUsers / facility.total_stalls) * 5;
      const pressure = waitTime > 4 ? 'HIGH' : waitTime > 2 ? 'MEDIUM' : 'LOW';

      db.prepare('INSERT INTO crowd_queue (facility_id, current_users, wait_time_mins, pressure_level, timestamp) VALUES (?, ?, ?, ?, ?)')
        .run(facility.id, currentUsers, waitTime, pressure, new Date().toISOString());

      // 5. Emit Events
      io.emit('sensor_update', {
        facility_id: facility.id,
        ammonia,
        humidity,
        floor_wet,
        tissue_level: tissue,
        soap_level: soap,
        timestamp: new Date().toISOString()
      });

      io.emit('queue_update', {
        facility_id: facility.id,
        current_users: currentUsers,
        wait_time: waitTime,
        pressure_level: pressure
      });

      if (status === 'RED' || (tissue < 20) || (soap < 15)) {
        io.emit('maintenance_alert', {
          facility_id: facility.id,
          alert_type: status === 'RED' ? 'CRITICAL_CLEANLINESS' : 'SUPPLY_LOW',
          message: reason,
          severity: status === 'RED' ? 'HIGH' : 'MEDIUM'
        });
      }
    }
  });
};
